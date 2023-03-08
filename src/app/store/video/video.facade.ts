import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { IMedia } from 'src/app/models/media';

import { Store } from '@ngrx/store';

import { exportVideo, loadVideos, loadVideoSilence } from './video.actions';
import { VideoState } from './video.reducer';
import {
  selectMediaList,
  selectOutput,
  selectVideoLoading,
} from './video.selectors';

@Injectable()
export class VideoFacade {
  constructor(private videoStore: Store<VideoState>) {}

  loadVideos(media: IMedia[]): void {
    this.videoStore.dispatch(
      loadVideos({
        mediaList: media,
      })
    );
  }

  searchSilences(media: IMedia): void {
    this.videoStore.dispatch(
      loadVideoSilence({
        media,
      })
    );
  }

  getVideos(): Observable<IMedia[]> {
    return this.videoStore.select(selectMediaList);
  }

  getOutput(): Observable<Blob | undefined> {
    return this.videoStore.select(selectOutput);
  }

  videoIsLoading(): Observable<boolean> {
    return this.videoStore.select(selectVideoLoading);
  }

  exportVideo(media: IMedia): void {
    this.videoStore.dispatch(
      exportVideo({
        media,
      })
    );
  }
}
