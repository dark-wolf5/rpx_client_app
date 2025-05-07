import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'shortenDisplayName',
})
export class ShortenDisplayNamePipe implements PipeTransform {
  transform(value: string): string {
    let firstAndSecond = value.split(' ');
    if (firstAndSecond.length === 1) {
      return firstAndSecond[0].substring(0, 3) + '.';
    }

    return firstAndSecond[0].substring(0, 3) + '.' + firstAndSecond[1].substring(0, 1) + '.';
  }
}
