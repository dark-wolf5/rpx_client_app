import {Pipe, PipeTransform} from '@angular/core';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(d: Date): string {
    const format_date =
      monthNames[d.getMonth()] +
      ' ' +
      (d.getDate() + 1) +
      ', ' +
      d.getFullYear();

    return format_date;
  }
}

@Pipe({
  name: 'timeFormat',
})
export class TimeFormatPipe implements PipeTransform {
  transform(timex: string): string {
    const time = timex.split(':'); // convert to array

    // fetch
    const hours = Number(time[0]);
    const minutes = Number(time[1]);
    const seconds = Number(time[2]);

    // calculate
    let timeValue;

    if (hours > 0 && hours <= 12) {
      timeValue = '' + hours;
    } else if (hours > 12) {
      timeValue = '' + (hours - 12);
    } else if (hours == 0) {
      timeValue = '12';
    }

    timeValue += minutes < 10 ? ':0' + minutes : ':' + minutes; // get minutes
    timeValue += hours >= 12 ? ' PM' : ' AM'; // get AM/PM

    return timeValue;
  }
}
