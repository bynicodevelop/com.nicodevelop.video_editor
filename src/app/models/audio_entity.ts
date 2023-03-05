import { IAudio } from './audio';
import { ISilence } from './silence';

export class AudioEntity implements IAudio {
  noNoise: Blob | undefined;
  silences: ISilence[] | undefined;
  source: Blob | undefined;
  sourceUrl: string | undefined;

  constructor(
    source: Blob | undefined,
    sourceUrl: string | undefined,
    noNoise: Blob | undefined,
    silences: ISilence[] | undefined
  ) {
    this.noNoise = noNoise;
    this.silences = silences;
    this.source = source;
    this.sourceUrl = sourceUrl;
  }
}
