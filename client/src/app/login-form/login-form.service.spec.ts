import { TestBed, inject } from '@angular/core/testing';

import { LoginFormService } from './login-form.service';

describe('LoginFormService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginFormService]
    });
  });

  it('should be created', inject([LoginFormService], (service: LoginFormService) => {
    expect(service).toBeTruthy();
  }));
});
