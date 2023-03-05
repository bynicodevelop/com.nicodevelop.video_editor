import { VideoPlayerDirective } from './video-player.directive';

describe('VideoPlayerDirective', () => {
  it('should create an instance', () => {
    const directive = new VideoPlayerDirective({} as any);
    expect(directive).toBeTruthy();
  });
});
