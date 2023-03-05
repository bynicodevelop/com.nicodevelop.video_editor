import { IMedia } from 'src/app/models/media';

import { createFeatureSelector, createSelector } from '@ngrx/store';

import { videoFeatureKey, VideoState } from './video.reducer';

export const selectVideoState =
  createFeatureSelector<VideoState>(videoFeatureKey);

export const selectMediaList = createSelector(
  selectVideoState,
  (state: VideoState): IMedia[] => state.mediaList
);

export const selectVideoLoading = createSelector(
  selectVideoState,
  (state: VideoState): boolean => state.loading
);
