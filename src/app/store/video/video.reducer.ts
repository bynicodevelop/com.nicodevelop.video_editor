import { IMedia } from 'src/app/models/media';

import { ActionReducer, createReducer, MetaReducer, on } from '@ngrx/store';

import {
  exportVideo,
  exportVideoSuccess,
  loadVideos,
  loadVideoSilence,
  loadVideoSilenceSuccess,
  loadVideosSuccess,
  loadVideoWithoutNoise,
  loadVideoWithoutNoiseSuccess,
} from './video.actions';

export const videoFeatureKey = 'video';

export interface VideoState {
  mediaList: IMedia[];
  loading: boolean;
}

export const initialState: VideoState = {
  mediaList: [],
  loading: false,
};

const log = (reducer: ActionReducer<VideoState>): ActionReducer<VideoState> => {
  return (state, action): VideoState => {
    const currentState = reducer(state, action);

    console.groupCollapsed(action.type);
    console.log('Etat precedent: ', state);
    console.log('Action: ', action);
    console.log('Etat suivant: ', currentState);
    console.groupEnd();

    return currentState;
  };
};

export const videoMetaReducers: MetaReducer[] = [log];

export const videoReducer = createReducer(
  initialState,
  on(loadVideos, (state, { mediaList }): VideoState => {
    return {
      ...state,
      mediaList,
      loading: true,
    };
  }),
  on(loadVideosSuccess, (state, { mediaList }): VideoState => {
    return {
      ...state,
      mediaList,
      loading: false,
    };
  }),
  on(loadVideoSilence, (state): VideoState => {
    return {
      ...state,
      loading: true,
    };
  }),
  on(loadVideoSilenceSuccess, (state, { media }): VideoState => {
    return {
      ...state,
      mediaList: state.mediaList.map((v: IMedia): IMedia => {
        if (v.video.source === media.video.source) {
          return media;
        }

        return v;
      }),
      loading: false,
    };
  }),
  on(loadVideoWithoutNoise, (state): VideoState => {
    return {
      ...state,
      loading: true,
    };
  }),
  on(loadVideoWithoutNoiseSuccess, (state, { media }): VideoState => {
    return {
      ...state,
      mediaList: state.mediaList.map((v: IMedia): IMedia => {
        if (v.video.source === media.video.source) {
          return media;
        }

        return v;
      }),
      loading: false,
    };
  }),
  on(exportVideo, (state): VideoState => {
    return {
      ...state,
      loading: true,
    };
  }),
  on(exportVideoSuccess, (state, { media }): VideoState => {
    return {
      ...state,
      mediaList: state.mediaList.map((v: IMedia): IMedia => {
        if (v.video.source === media.video.source) {
          return media;
        }

        console.log('json', JSON.stringify(v));

        return v;
      }),
      loading: false,
    };
  })
);
