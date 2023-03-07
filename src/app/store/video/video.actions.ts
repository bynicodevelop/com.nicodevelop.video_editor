import { IMedia } from 'src/app/models/media';

import { createAction, props } from '@ngrx/store';

export const loadVideos = createAction(
  '[Video] Load Videos',
  props<{ mediaList: IMedia[] }>()
);

export const loadVideosSuccess = createAction(
  '[Video] Load Videos Success',
  props<{ mediaList: IMedia[] }>()
);

export const loadVideoSilence = createAction(
  '[Video] Load Video Silence',
  props<{ media: IMedia }>()
);

export const loadVideoSilenceSuccess = createAction(
  '[Video] Load Video Silence Success',
  props<{ media: IMedia }>()
);

export const loadVideoWithoutNoise = createAction(
  '[Video] Load Video Without Noise',
  props<{ media: IMedia }>()
);

export const loadVideoWithoutNoiseSuccess = createAction(
  '[Video] Load Video Without Noise Success',
  props<{ media: IMedia }>()
);

export const exportVideo = createAction(
  '[Video] Export Video',
  props<{ media: IMedia }>()
);

export const exportVideoSuccess = createAction(
  '[Video] Export Video Success',
  props<{ media: IMedia }>()
);
