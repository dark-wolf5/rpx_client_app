import {Directive, ElementRef, HostListener} from '@angular/core';
import {NgModel} from '@angular/forms';

@Directive({
  selector: '[personName]',
  providers: [NgModel],
})
export class PersonNameDirective {
  constructor(public ref: ElementRef) {}

  @HostListener('input', ['$event']) lettersAndSpacesOnly(
    event: HTMLElementEvent<HTMLInputElement>
  ) {
    const regex = /^[a-zA-Z\s]*$/;
    const replaceRegex = /[^a-zA-Z\s]+/;

    let str = event.target!.value;

    // allow letters and spaces only.
    if (!regex.test(event.key.value)) {
      str = str.replace(replaceRegex, '');
      this.ref!.nativeElement.value = str;
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event']) replaceInvalidCharacters(
    event: HTMLElementEvent<HTMLInputElement>
  ) {
    const replaceRegex = /[^a-zA-Z\s]+/;
    event.target!.value = event.target!.value.replace(replaceRegex, '');
  }
}

type HTMLElementEvent<T extends HTMLElement> = Event & {
  target: T;
  key: T;
};
