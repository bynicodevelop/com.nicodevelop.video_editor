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
  private ffmpeg: FFmpeg;

  private logContent: string = '';

  private silences: {
    silence_start: number;
    silence_end: number;
    silence_duration: number;
  }[] = [];

  private duration: number = 0;

  constructor() {
    this.ffmpeg = createFFmpeg({
      log: true,
      mainName: 'main',
      corePath: 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js',
    });

    this.ffmpeg.setLogger((msg): string => {
      this._silenceFilter(msg.message);
      this._durationFileter(msg.message);

      return (this.logContent += msg.message);
    });
  }

  private _durationFileter(message: string): void {
    const DURATION_REGEX = /Duration:\s+(\d+:\d+:\d+\.\d+)/g;

    const duration = DURATION_REGEX.exec(message);

    if (duration) {
      this.duration = parseFloat(
        duration[1]
          .split(':')
          .reduce((acc, time): number => {
            return 60 * acc + parseFloat(time);
          }, 0)
          .toFixed(4)
      );
    }
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
    if (!this.ffmpeg.isLoaded()) {
      await this.ffmpeg.load();
    }
  }

  private async _convertVideoToAudio(media: IMedia): Promise<IMedia> {
    await this._loadFFmpeg();

    this.ffmpeg.FS(
      'writeFile',
      'video.mp4',
      await fetchFile(media.video.source!)
    );

    await this.ffmpeg.run('-i', 'video.mp4', 'audio.mp3');

    const data = this.ffmpeg.FS('readFile', 'audio.mp3');

    const audio = new Blob([data.buffer], { type: 'audio/mp3' });

    this.ffmpeg.exit();

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

    this.ffmpeg.FS('writeFile', 'audio.mp3', await fetchFile(audio!));

    await this.ffmpeg.run(
      '-i',
      'audio.mp3',
      '-af',
      'silencedetect=n=-30dB:d=1',
      'silence.mp3'
    );

    this.ffmpeg.exit();

    return this.silences.map(
      (silence): ISilence => ({
        start: silence.silence_start,
        end: silence.silence_end,
        duration: silence.silence_duration,
      })
    );
  }

  /**
   * Crée un fichier contenant une liste de fichiers vidéo exluant les silences.
   * @param listCut Liste des coupures vidéo silencieuses.
   * @param filename Nom du fichier à créer.
   * @returns Une promesse résolue une fois que le fichier a été créé.
   */
  private async _createFileSilence(
    listCut: Uint8Array[],
    filename: string
  ): Promise<void> {
    const blobList = listCut.map(
      (data): Blob => new Blob([data.buffer], { type: 'video/mp4' })
    );

    const videoFilenames = [];
    const fileString = [];

    for (let i = 0; i < blobList.length; i++) {
      const blob = blobList[i];
      const filename = `video${i}.mp4`;

      videoFilenames.push(filename);
      await this.ffmpeg.FS('writeFile', filename, await fetchFile(blob));

      fileString.push(`file '${filename}'`);
    }

    await this.ffmpeg.FS('writeFile', filename, fileString.join('\r'));
  }

  /**
   * Exporte une vidéo concaténée à partir d'un fichier de concaténation et d'un nom de fichier de sortie.
   * @param outpuFileName Le nom du fichier de sortie pour la vidéo concaténée.
   * @param concatFileName Le nom du fichier de concaténation contenant la liste des fichiers à concaténer.
   * @returns Une promesse résolue avec un objet Blob représentant la vidéo concaténée.
   */
  private async _exportVideo(
    outpuFileName: string,
    concatFileName: string
  ): Promise<Blob> {
    await this.ffmpeg.run(
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatFileName,
      '-c',
      'copy',
      outpuFileName
    );

    const data = this.ffmpeg.FS('readFile', outpuFileName);

    return new Blob([data.buffer], { type: 'video/mp4' });
  }

  /**
   * Coupe une vidéo en fonction du temps de début et de fin spécifié.
   * @param start Le temps de début de la coupe, en secondes.
   * @param end Le temps de fin de la coupe, en secondes.
   * @param inputPath Le chemin d'accès de la vidéo d'entrée.
   * @param outputPath Le chemin d'accès de la vidéo de sortie.
   * @returns La vidéo coupée en tant que Uint8Array.
   */
  private async _cutVideo(
    start: number,
    end: number,
    inputPath: string,
    outputPath: string
  ): Promise<Uint8Array> {
    await this.ffmpeg.run(
      '-i',
      inputPath,
      '-ss',
      start.toString(),
      '-to',
      end.toString(),
      outputPath
    );

    return this.ffmpeg.FS(`readFile`, outputPath);
  }

  /**
   * Doit supprimer les silences de la vidéo à partir de la liste des silences
   * Et retourner la vidéo sans silences (découper la vidéo)
   * @param media
   */
  private async _removeSilence(media: IMedia): Promise<IMedia> {
    await this._loadFFmpeg();

    const inputPath = 'input.mp4';

    const silenceList = media.audio?.silences || [];

    if (silenceList.length > 0) {
      let i = 0;

      const listCut = [];

      for (const silence of silenceList) {
        await this._loadFFmpeg();

        this.ffmpeg.FS(
          'writeFile',
          inputPath,
          await fetchFile(media.video.source!)
        );

        if (silenceList[i + 1]) {
          listCut.push(
            await this._cutVideo(
              silence.end,
              silenceList[i + 1].start,
              inputPath,
              `output${i}.mp4`
            )
          );
        }

        this.ffmpeg.exit();

        i++;
      }

      await this._loadFFmpeg();

      await this._createFileSilence(listCut, 'list.txt');

      console.log(this.ffmpeg.FS('readdir', '.'));

      const video = await this._exportVideo('output.mp4', 'list.txt');

      this.ffmpeg.exit();

      return {
        ...media,
        output: video,
      };
    }

    return media;
  }

  private async _removeNoise(media: IMedia): Promise<IMedia> {
    await this._loadFFmpeg();

    this.ffmpeg.FS(
      'writeFile',
      'video.mp4',
      await fetchFile(media.video.source!)
    );

    await this.ffmpeg.run(
      '-i',
      'video.mp4',
      '-af',
      'silenceremove=1:0:-50dB',
      'audio.mp3'
    );

    const data = this.ffmpeg.FS('readFile', 'audio.mp3');

    const audio = new Blob([data.buffer], { type: 'audio/mp3' });

    this.ffmpeg.exit();

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

  exportVideo(media: IMedia): Observable<IMedia> {
    return defer(async (): Promise<any> => {
      const { output } = await this._removeSilence(media);

      return {
        ...media,
        output,
      };
    });
  }
}
