import { TestBed } from '@angular/core/testing';

import { registerService } from './Register-service';

describe('LoginServiceService', () => {
  let service: registerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(registerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
