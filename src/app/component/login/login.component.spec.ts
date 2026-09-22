import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { SharedService } from 'src/app/services/shared.service';
import { UserService } from 'src/app/services/user.service';

const userServiceMock = {
  login: jasmine.createSpy('login').and.returnValue(of({ message: 'welcome', token: 'token-123' })),
};

const sharedServiceMock = {
  updateUserData: jasmine.createSpy('updateUserData'),
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule, RouterTestingModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: SharedService, useValue: sharedServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('stores the token and notifies shared user state after successful login', () => {
    component.email = 'user@example.com';
    component.password = 'secret';

    component.logIn();

    expect(userServiceMock.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret',
    });
    expect(sharedServiceMock.updateUserData).toHaveBeenCalled();
    expect(localStorage.getItem('userToken')).toBe('token-123');
  });
});
