import { Injectable } from '@angular/core';

import { map, mergeMap, Observable } from 'rxjs';
import { VideoService } from 'src/app/services/video.service';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import {
  loadVideos,
  loadVideoSilence,
  loadVideoSilenceSuccess,
  loadVideosSuccess,
  loadVideoWithoutNoise,
  loadVideoWithoutNoiseSuccess,
} from './video.actions';

@Injectable()
export class VideoEffects {
  constructor(private actions$: Actions, private videoService: VideoService) {}

  loadVideos$ = createEffect((): Observable<any> => {
    return this.actions$.pipe(
      ofType(loadVideos),
      mergeMap(
        (action): Observable<any> =>
          this.videoService
            .getAudioFromVideo(action.mediaList)
            .pipe(map((mediaList): any => loadVideosSuccess({ mediaList })))
      )
    );
  });

  loadVideoSilence$ = createEffect((): Observable<any> => {
    return this.actions$.pipe(
      ofType(loadVideoSilence),
      mergeMap(
        (action): Observable<any> =>
          this.videoService
            .getAudioSilence(action.media)
            .pipe(map((media): any => loadVideoSilenceSuccess({ media })))
      )
    );
  });

  loadVideoWithoutNoise$ = createEffect((): Observable<any> => {
    return this.actions$.pipe(
      ofType(loadVideoWithoutNoise),
      mergeMap(
        (action): Observable<any> =>
          this.videoService
            .getAudioWithoutNoise(action.media)
            .pipe(map((media): any => loadVideoWithoutNoiseSuccess({ media })))
      )
    );
  });
}
