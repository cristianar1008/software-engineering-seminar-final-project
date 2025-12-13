import { TestBed } from '@angular/core/testing';
import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter([]),
        provideAnimations(),
        AuthService
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
