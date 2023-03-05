import { ISeekEvent } from 'src/app/models/seek_event';

export interface PlayerInterface {
  togglePlay(): void;
  seekTo(seekEvent: ISeekEvent): void;
}
