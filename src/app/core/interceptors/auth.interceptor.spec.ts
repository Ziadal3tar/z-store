import { HttpRequest } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;

  beforeEach(() => {
    localStorage.clear();
    interceptor = new AuthInterceptor();
  });

  afterEach(() => localStorage.clear());

  it('should attach the bearer token to outgoing requests', () => {
    localStorage.setItem('userToken', 'token-123');
    const request = new HttpRequest('GET', '/products');
    const next = { handle: jasmine.createSpy('handle').and.returnValue({ subscribe() {} }) };

    interceptor.intercept(request, next as any);

    const forwarded = next.handle.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(forwarded.headers.get('authorization')).toBe('Bearer__token-123');
  });

  it('should not overwrite an existing authorization header', () => {
    localStorage.setItem('userToken', 'token-123');
    const request = new HttpRequest('GET', '/products', {
      headers: { authorization: 'Custom token' },
    });
    const next = { handle: jasmine.createSpy('handle').and.returnValue({ subscribe() {} }) };

    interceptor.intercept(request, next as any);

    const forwarded = next.handle.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(forwarded).toBe(request);
    expect(forwarded.headers.get('authorization')).toBe('Custom token');
  });

  it('should leave requests unchanged when no token exists', () => {
    const request = new HttpRequest('GET', '/products');
    const next = { handle: jasmine.createSpy('handle').and.returnValue({ subscribe() {} }) };

    interceptor.intercept(request, next as any);

    expect(next.handle).toHaveBeenCalledWith(request);
  });
});
