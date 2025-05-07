import {TestBed} from '@angular/core/testing';

import {RpxMetaService} from './rpx-meta.service';

describe('RpxMetaService', () => {
  let service: RpxMetaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RpxMetaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
