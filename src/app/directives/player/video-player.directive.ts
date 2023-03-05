import {
  Directive,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';

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

  constructor(
    private videoPlayer: ElementRef,
  ) {}

  ngOnInit(): void {
    const video = this.videoPlayer.nativeElement as HTMLVideoElement;

    video.muted = this.muted;
  }

  togglePlay(): void {
    const video = this.videoPlayer.nativeElement as HTMLVideoElement;

    video.paused ? video.play() : video.pause();
  }
}
