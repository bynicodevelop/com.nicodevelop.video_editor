import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { VideoEffects } from './video.effects';

describe('VideoEffects', () => {
  let actions$: Observable<any>;
  let effects: VideoEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VideoEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(VideoEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
