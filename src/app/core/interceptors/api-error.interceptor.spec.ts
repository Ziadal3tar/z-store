import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiErrorInterceptor } from './api-error.interceptor';
import { setAuthToken, clearAuthToken } from '../auth-token.util';

describe('ApiErrorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: HTTP_INTERCEPTORS, useClass: ApiErrorInterceptor, multi: true },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    clearAuthToken();
  });

  afterEach(() => {
    controller.verify();
    clearAuthToken();
  });

  it('clears the auth token and redirects on an authenticated 401', () => {
    setAuthToken('token');

    http.get('/api/products').subscribe({ error: () => undefined });
    controller.expectOne('/api/products').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not redirect for login failures', () => {
    setAuthToken('token');

    http.post('/api/logIn', {}).subscribe({ error: () => undefined });
    controller.expectOne('/api/logIn').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
