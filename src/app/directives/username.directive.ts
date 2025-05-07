import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[username]',
})
export class UsernameDirective {
  constructor(public ref: ElementRef) {}

  @HostListener('input', ['$event']) onInput(
    event: HTMLElementEvent<HTMLInputElement>
  ) {
    const regex = /^[a-zA-Z0-9]*$/;
    const replaceRegex = /[^a-zA-Z0-9/-]+/;
    let str = event.target.value;

    // allow letters and numbers only.
    if (!regex.test(event.key.value)) {
      str = str.replace(replaceRegex, '');
      this.ref.nativeElement.value = str;
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event']) onBlur(
    event: HTMLElementEvent<HTMLInputElement>
  ) {
    const replaceRegex = /[^a-zA-Z0-9/-]+/;
    event.target.value = event.target.value.replace(replaceRegex, '');
  }
}

type HTMLElementEvent<T extends HTMLElement> = Event & {
  target: T;
  key: T;
};
