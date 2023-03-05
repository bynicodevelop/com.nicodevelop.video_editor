import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
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
import {
  loadVideos,
  loadVideoSilence,
} from 'src/app/store/video/video.actions';
import { VideoState } from 'src/app/store/video/video.reducer';
import {
  selectMediaList,
  selectVideoLoading,
} from 'src/app/store/video/video.selectors';

import { Store } from '@ngrx/store';

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

  isPlaying: boolean = false;

  isReady: Observable<boolean> = of(false);

  mediaList$: Observable<MediaEntity[]> = this.videoStore
    .select(selectMediaList)
    .pipe(
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
            )
          );
        });
      })
    );

  isLoading$: Observable<boolean> = this.videoStore.select(selectVideoLoading);

  duration: number = 0;
  time: number = 0;

  constructor(
    private videoStore: Store<VideoState>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.isReady = combineLatest([
      this.mediaList$,
      this.videoStore.select(selectVideoLoading),
    ]).pipe(
      tap(console.log),
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
  }

  onUpdatedVideoList(mediaList: IMedia[]): void {
    this.videoStore.dispatch(
      loadVideos({
        mediaList,
      })
    );
  }

  onNewVideo(): void {
    this.videoStore.dispatch(loadVideos({ mediaList: [] }));

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
        tap((media: IMedia | undefined): void => console.log(media)),
        filter((media: IMedia | undefined): boolean => !media?.audio?.silences)
      )
      .subscribe((media: IMedia | undefined): void => {
        if (media) {
          this.videoStore.dispatch(
            loadVideoSilence({
              media,
            })
          );
        }
      });
  }

  @HostListener('window:keydown.space', ['$event'])
  onSpace(event: KeyboardEvent): void {
    if (!this.isReady) return;

    this.togglePlay();

    event.preventDefault();
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
