import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[RpxStopClickPropagation]',
})
export class StopClickPropagationDirective {
  @HostListener('click', ['$event'])
  public onClick(event: any): void {
    event.stopPropagation();
  }
}
