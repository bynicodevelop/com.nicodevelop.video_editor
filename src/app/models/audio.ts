import { ISilence } from './silence';

export interface IAudio {
  source: Blob | undefined;
  noNoise: Blob | undefined;
  silences: ISilence[] | undefined;
}
