import { TestBed } from '@angular/core/testing';

import { AgoraWrapperService } from './agora-wrapper.service';

describe('AgoraWapperService', () => {
  let service: AgoraWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgoraWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
