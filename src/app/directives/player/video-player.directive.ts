import {
  Directive,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';

import { ISeekEvent } from 'src/app/models/seek_event';

import { PlayerInterface } from './player-interface';

@Directive({
  selector: '[appVideoPlayer]',
})
export class VideoPlayerDirective implements OnInit, PlayerInterface {
  @Input()
  muted: boolean = false;

  @Input()
  set time(time: number) {
    const video = this.videoPlayer.nativeElement as HTMLVideoElement;

    if (video.currentTime !== time) {
      video.currentTime = time;
    }

    this._time = time;
  }

  get time(): number {
    return this._time;
  }

  _time: number = 0;

  constructor(private videoPlayer: ElementRef) {}

  ngOnInit(): void {
    const video = this.videoPlayer.nativeElement as HTMLVideoElement;

    video.muted = this.muted;
  }

  seekTo(seekEvent: ISeekEvent): void {
    const video = this.videoPlayer.nativeElement as HTMLVideoElement;

    video.currentTime = seekEvent.value;
  }

  togglePlay(): void {
    const video = this.videoPlayer.nativeElement as HTMLVideoElement;

    video.paused ? video.play() : video.pause();
  }
}
