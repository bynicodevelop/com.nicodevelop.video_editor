import { Component, EventEmitter, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { IMedia } from 'src/app/models/media';

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss'],
})
export class DropzoneComponent {
  video: IMedia[] = [];

  @Output()
  updatedVideoList = new EventEmitter<IMedia[]>();

  constructor(private sanitizer: DomSanitizer) {}

  onFileDropped($event: FileList[] | any): void {
    let files: FileList[] = $event;

    if (!($event instanceof FileList)) {
      files = [...$event.target.files];
    }

    this.prepareFilesList(files);
  }

  prepareFilesList(files: FileList[]): void {
    this.video = files.map((file: any): IMedia => {
      return {
        video: {
          source: file,
        },
        audio: undefined,
      };
    });

    this.updatedVideoList.emit(this.video);
  }
}
