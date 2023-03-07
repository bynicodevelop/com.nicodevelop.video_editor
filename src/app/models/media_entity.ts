import { AudioEntity } from './audio_entity';
import { IMedia } from './media';
import { VideoEntity } from './video_entity';

export class MediaEntity implements IMedia {
  audio: AudioEntity | undefined;
  video: VideoEntity;
  output: Blob | undefined;

  constructor(
    audio: AudioEntity | undefined,
    video: VideoEntity,
    output?: Blob
  ) {
    this.audio = audio;
    this.video = video;
    this.output = output;
  }
}
