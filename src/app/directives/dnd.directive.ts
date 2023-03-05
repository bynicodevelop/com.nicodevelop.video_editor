import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appDnd]',
})
export class DndDirective {
  @HostBinding('class.dragover')
  dragover = false;

  @Output()
  fileDropped = new EventEmitter<FileList[]>();

  @HostListener('dragover', ['$event'])
  onDragOver(event: any): void {
    event.preventDefault();

    this.dragover = true;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;

    if (files.length > 0) {
      this.fileDropped.emit(files);
    }

    this.dragover = false;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: any): void {
    event.preventDefault();

    this.dragover = false;
  }
}
