import { IAudio } from './audio';
import { IVideo } from './video';

export interface IMedia {
  video: IVideo;
  audio: IAudio | undefined;
  output: Blob | undefined;
}
