import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { combineLatest, filter, map, Observable, of, tap } from 'rxjs';
import { AudioWavePlayerDirective } from 'src/app/directives/player/audio-wave-player.directive';
import { PlayerInterface } from 'src/app/directives/player/player-interface';
import { VideoPlayerDirective } from 'src/app/directives/player/video-player.directive';
import { AudioEntity } from 'src/app/models/audio_entity';
import { IMedia } from 'src/app/models/media';
import { MediaEntity } from 'src/app/models/media_entity';
import { ISeekEvent } from 'src/app/models/seek_event';
import { VideoEntity } from 'src/app/models/video_entity';
import { VideoFacade } from 'src/app/store/video/video.facade';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, PlayerInterface {
  @ViewChild(AudioWavePlayerDirective)
  private audioWavePlayer!: AudioWavePlayerDirective;

  @ViewChild(VideoPlayerDirective)
  private videoPlayer!: VideoPlayerDirective;

  cutModel = new FormControl(false);

  isPlaying: boolean = false;

  isReady: Observable<boolean> = of(false);

  mediaList$: Observable<MediaEntity[]> = this.videoFacade.getVideos().pipe(
    tap((mediaList: IMedia[]): void => console.log(JSON.stringify(mediaList))),
    map((mediaList: IMedia[]): MediaEntity[] => {
      return mediaList.map((media: IMedia): MediaEntity => {
        return new MediaEntity(
          media.audio
            ? new AudioEntity(
                media.audio?.source,
                URL.createObjectURL(media.audio?.source!),
                media.audio?.noNoise,
                media.audio?.silences
              )
            : undefined,
          new VideoEntity(
            media.video.source!,
            this.sanitizer.bypassSecurityTrustUrl(
              URL.createObjectURL(media.video.source!)
            )
          ),
          media.output
        );
      });
    })
  );

  isLoading$: Observable<boolean> = this.videoFacade.videoIsLoading();

  outputFile$: Observable<Blob | undefined> = this.videoFacade.getOutput();

  duration: number = 0;
  time: number = 0;

  constructor(
    private videoFacade: VideoFacade,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.isReady = combineLatest([
      this.mediaList$,
      this.videoFacade.videoIsLoading(),
    ]).pipe(
      map(([mediaList, isLoading]): boolean => {
        const isMediaReady =
          mediaList.length > 0 &&
          mediaList.every(
            (media: IMedia): boolean =>
              media.video.source !== undefined &&
              media.audio?.source !== undefined
          );
        return isMediaReady && !isLoading;
      })
    );

    this.cutModel.valueChanges.subscribe((cut: boolean | null): void => {
      this.onCutChange(cut === true);
    });

    this.outputFile$.subscribe((outputFile: Blob | undefined): void => {
      if (outputFile) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(outputFile);
        a.download = 'output.mp4';
        a.click();
      }
    });
  }

  onUpdatedVideoList(mediaList: IMedia[]): void {
    this.videoFacade.loadVideos(mediaList);
  }

  onNewVideo(): void {
    this.videoFacade.loadVideos([]);
    this.onReady(false);

    this.cutModel.reset();

    this.isPlaying = false;
    this.duration = 0;
    this.time = 0;
  }

  onLoadedMetadata(video: HTMLVideoElement): void {
    this.duration = video.duration;
  }

  onTimeUpdate(video: HTMLVideoElement): void {
    this.time = video.currentTime;
  }

  onSeek(seekEvent: ISeekEvent): void {
    this.time = this.duration * seekEvent.value;

    this.seekTo(seekEvent);
  }

  onReady(ready: boolean): void {
    this.isReady = of(ready);
  }

  onCutChange(cut: boolean): void {
    this.onReady(false);

    this.mediaList$
      .pipe(
        map((mediaList): IMedia | undefined => {
          return mediaList[0];
        }),
        tap((media: IMedia | undefined): void => console.log('media', media)),
        filter((media: IMedia | undefined): boolean => !media?.audio?.silences)
      )
      .subscribe((media: IMedia | undefined): void => {
        if (media) {
          this.videoFacade.searchSilences(media);
        }
      });
  }

  @HostListener('window:keydown.space', ['$event'])
  onSpace(event: KeyboardEvent): void {
    if (!this.isReady) return;

    this.togglePlay();

    event.preventDefault();
  }

  onExport(): void {
    this.mediaList$
      .pipe(
        map((mediaList): MediaEntity | undefined => {
          return mediaList[0];
        }),
        filter((media: MediaEntity | undefined): boolean => !media?.output)
      )
      .subscribe((media: IMedia | undefined): void => {
        if (media) {
          this.videoFacade.exportVideo(media);
        }
      });
  }

  seekTo(seekEvent: ISeekEvent): void {
    this.audioWavePlayer.seekTo(seekEvent);
    this.videoPlayer.seekTo(seekEvent);
  }

  togglePlay(): void {
    this.audioWavePlayer.togglePlay();
    this.videoPlayer.togglePlay();

    this.isPlaying = !this.isPlaying;
  }
}
