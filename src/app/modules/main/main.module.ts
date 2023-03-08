import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DropzoneComponent } from 'src/app/components/dropzone/dropzone.component';
import { CheckboxComponent } from 'src/app/components/inputs/checkbox/checkbox.component';
import { TimerComponent } from 'src/app/components/timer/timer.component';
import { DndDirective } from 'src/app/directives/dnd.directive';
import { AudioWavePlayerDirective } from 'src/app/directives/player/audio-wave-player.directive';
import { VideoPlayerDirective } from 'src/app/directives/player/video-player.directive';
import { SecondToTimePipe } from 'src/app/formatters/second-to-time.pipe';
import { VideoFacade } from 'src/app/store/video/video.facade';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';

@NgModule({
  declarations: [
    MainComponent,
    DropzoneComponent,
    DndDirective,
    AudioWavePlayerDirective,
    VideoPlayerDirective,
    TimerComponent,
    SecondToTimePipe,
    CheckboxComponent,
  ],
  imports: [CommonModule, MainRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [VideoFacade],
})
export class MainModule {}
