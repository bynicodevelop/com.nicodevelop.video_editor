import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

import { ISilence } from 'src/app/models/silence';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';

import { PlayerInterface } from './player-interface';

@Directive({
  selector: '[appAudioWavePlayer]',
})
export class AudioWavePlayerDirective implements OnInit, PlayerInterface {
  @Input()
  src?: SafeUrl;

  @Input()
  silences: ISilence[] | undefined;

  @Output()
  seek: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  ready: EventEmitter<boolean> = new EventEmitter<boolean>();

  private wavesurfer?: WaveSurfer;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.wavesurfer = WaveSurfer.create({
      container: this.elementRef.nativeElement,
      waveColor: 'violet',
      progressColor: 'purple',
      barHeight: 1,
      barWidth: 2,
      height: 100,
      plugins: [RegionsPlugin.create({})],
    });

    this.wavesurfer?.on('seek', (value: number): void => {
      this.seek.emit(value);
    });

    this.wavesurfer?.on('ready', (): void => {
      this.ready.emit(true);
    });
  }

  ngAfterViewInit(): void {
    this.wavesurfer?.load(this.src?.toString() || '');

    for (const silence of this.silences || []) {
      this.wavesurfer?.regions.add({
        start: silence.start,
        end: silence.end,
        color: 'rgba(255, 0, 0, 0.3)',
        drag: false,
        resize: false,
        loop: false,
      });
    }
  }

  ngOnDestroy(): void {
    this.wavesurfer?.destroy();
  }

  togglePlay(): void {
    if (this.wavesurfer?.isPlaying()) {
      this.wavesurfer?.pause();
    } else {
      this.wavesurfer?.play();
    }
  }
}
