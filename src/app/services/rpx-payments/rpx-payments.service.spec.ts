import {TestBed} from '@angular/core/testing';

import {RpxPaymentsService} from './rpx-payments.service';

describe('RpxPaymentsService', () => {
  let service: RpxPaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RpxPaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
