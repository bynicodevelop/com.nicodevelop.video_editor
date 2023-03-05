import { SafeUrl } from '@angular/platform-browser';

import { IVideo } from './video';

export class VideoEntity implements IVideo {
  source: File | undefined;
  sourceUrl: SafeUrl | undefined;

  constructor(source: File, sourceUrl: SafeUrl) {
    this.source = source;
    this.sourceUrl = sourceUrl;
  }
}
