import { initialState, videoReducer } from './video.reducer';

describe('Video Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = videoReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
