import { Injectable } from '@angular/core';

import { defer, Observable } from 'rxjs';

import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg';

import { IAudio } from '../models/audio';
import { IMedia } from '../models/media';
import { ISilence } from '../models/silence';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private ffmepeg: FFmpeg;

  private logContent: string = '';

  private silences: {
    silence_start: number;
    silence_end: number;
    silence_duration: number;
  }[] = [];

  constructor() {
    this.ffmepeg = createFFmpeg({
      log: true,
      mainName: 'main',
      corePath: 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js',
    });

    this.ffmepeg.setLogger((msg): string => {
      this._silenceFilter(msg.message);

      return (this.logContent += msg.message);
    });
  }

  private _silenceFilter(message: string): void {
    const SILENCE_START_REGEX =
      /silence_start:\s+([+-]?\d+\.?\d*(?:[eE][+-]?\d+)?)/g;
    const SILENCE_END_REGEX = /silence_end:\s+(\d+\.\d+)/g;
    const silencesLength = this.silences.length;

    const silenceStart = SILENCE_START_REGEX.exec(message);
    const silenceEnd = SILENCE_END_REGEX.exec(message);

    if (silenceStart) {
      this.silences.push({
        silence_start: parseFloat(parseFloat(silenceStart[1]).toFixed(4)),
        silence_end: 0,
        silence_duration: 0,
      });
    }

    if (silenceEnd && silencesLength > 0) {
      const lastSilence = this.silences[silencesLength - 1];
      lastSilence.silence_end = parseFloat(
        parseFloat(silenceEnd[1]).toFixed(4)
      );
      lastSilence.silence_duration = parseFloat(
        (parseFloat(silenceEnd[1]) - lastSilence.silence_start).toFixed(4)
      );
    }
  }

  private async _loadFFmpeg(): Promise<void> {
    if (!this.ffmepeg.isLoaded()) {
      await this.ffmepeg.load();
    }
  }

  private async _convertVideoToAudio(media: IMedia): Promise<IMedia> {
    await this._loadFFmpeg();

    this.ffmepeg.FS(
      'writeFile',
      'video.mp4',
      await fetchFile(media.video.source!)
    );

    await this.ffmepeg.run('-i', 'video.mp4', 'audio.mp3');

    const data = this.ffmepeg.FS('readFile', 'audio.mp3');

    const audio = new Blob([data.buffer], { type: 'audio/mp3' });

    this.ffmepeg.exit();

    return {
      ...media,
      audio: {
        ...media.audio,
        source: audio,
      } as IAudio,
    };
  }

  private async _getAudioSilence(video: IMedia): Promise<ISilence[]> {
    this.silences = [];

    await this._loadFFmpeg();

    const audio = video.audio?.source;

    this.ffmepeg.FS('writeFile', 'audio.mp3', await fetchFile(audio!));

    await this.ffmepeg.run(
      '-i',
      'audio.mp3',
      '-af',
      'silencedetect=n=-30dB:d=1',
      'silence.mp3'
    );

    this.ffmepeg.exit();

    return this.silences.map(
      (silence): ISilence => ({
        start: silence.silence_start,
        end: silence.silence_end,
        duration: silence.silence_duration,
      })
    );
  }

  private async _removeNoise(media: IMedia): Promise<IMedia> {
    await this._loadFFmpeg();

    this.ffmepeg.FS(
      'writeFile',
      'video.mp4',
      await fetchFile(media.video.source!)
    );

    // extract audio from video without noise
    await this.ffmepeg.run(
      '-i',
      'video.mp4',
      '-af',
      'silenceremove=1:0:-50dB',
      'audio.mp3'
    );

    const data = this.ffmepeg.FS('readFile', 'audio.mp3');

    const audio = new Blob([data.buffer], { type: 'audio/mp3' });

    this.ffmepeg.exit();

    return {
      ...media,
      audio: {
        ...media.audio,
        noNoise: audio,
      } as IAudio,
    };
  }

  getAudioFromVideo(video: IMedia[]): Observable<IMedia[]> {
    return defer(async (): Promise<IMedia[]> => {
      const videos = await Promise.all(
        video.map((video): Promise<IMedia> => this._convertVideoToAudio(video))
      );

      return videos;
    });
  }

  getAudioSilence(media: IMedia): Observable<IMedia> {
    return defer(async (): Promise<any> => {
      const silences = await this._getAudioSilence(media);

      return {
        ...media,
        audio: {
          ...media.audio,
          silences,
        } as IAudio,
      };
    });
  }

  getAudioWithoutNoise(video: IMedia): Observable<IMedia> {
    return defer(async (): Promise<any> => {
      const noise = await this._removeNoise(video);

      return {
        ...noise,
      };
    });
  }
}
