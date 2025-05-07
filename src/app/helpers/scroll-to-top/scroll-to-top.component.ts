import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.css'],
})
export class ScrollToTopComponent implements OnInit, AfterViewInit {
  @Input() inputWindow: ElementRef;

  @ViewChild('scrollArrow') scrollArrow: ElementRef;

  arrowOn = false;

  constructor() {}

  scrollTop() {
    $('#rpxMainRpxScroll').animate({scrollTop: 0}, 'slow');
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    $('#rpxMainRpxScroll').on('scroll', () => {
      // do your things like logging the Y-axis
      const scrollTopSpace = $('#rpxMainRpxScroll').scrollTop();

      if (scrollTopSpace < 119) {
        this.scrollArrow.nativeElement.className =
          'rpx-scroll-top rpx-arrow-transparent';
        this.arrowOn = false;
      } else if (this.arrowOn === false && scrollTop > 120) {
        this.arrowOn = true;
        this.scrollArrow.nativeElement.className = 'rpx-scroll-top';
      }
    });

    const scrollTop = $('#rpxMainRpxScroll').scrollTop();

    if (scrollTop > 50) {
      this.scrollArrow.nativeElement.className = 'rpx-scroll-top';
      this.arrowOn = true;
    }
  }
}
