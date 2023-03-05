import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

import { ISeekEvent } from 'src/app/models/seek_event';
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
  seek: EventEmitter<ISeekEvent> = new EventEmitter<ISeekEvent>();

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
      barWidth: 1,
      height: 100,
      plugins: [RegionsPlugin.create({})],
    });

    this.wavesurfer?.on('seek', (value: number, automatic: boolean): void => {
      if (automatic) return;

      this.seek.emit({
        value: value,
        automatic: false,
      });
    });

    this.wavesurfer?.on('ready', (): void => {
      this.ready.emit(true);
    });

    this.wavesurfer?.on('audioprocess', (value: number): void => {
      if (this.silences === undefined) return;

      const silenceRegion = this.silences.find(
        (region): boolean => region.start <= value && region.end >= value
      );

      if (silenceRegion) {
        this.seek.emit({
          value: silenceRegion.end,
          automatic: true,
        });
      }
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

  seekTo(seekEvent: ISeekEvent): void {
    if (!this.wavesurfer) {
      return;
    }

    const duration = this.wavesurfer.getDuration();
    const progress = seekEvent.value / duration;
    const automatic = seekEvent.automatic;

    if (automatic) {
      this.wavesurfer.seekTo(progress);
    }
  }

  togglePlay(): void {
    if (this.wavesurfer?.isPlaying()) {
      this.wavesurfer?.pause();
    } else {
      this.wavesurfer?.play();
    }
  }
}
