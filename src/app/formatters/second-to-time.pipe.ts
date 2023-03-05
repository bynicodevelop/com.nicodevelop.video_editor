import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondToTime',
})
export class SecondToTimePipe implements PipeTransform {
  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    const seconds: number = Math.floor(value % 60);

    const minutesString: string = minutes.toString().padStart(2, '0');
    const secondsString: string = seconds.toString().padStart(2, '0');

    return `${minutesString}:${secondsString}`;
  }
}
