import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { UserService } from 'src/app/core/services/user.service';
import { UserStateService } from 'src/app/core/state/user-state.service';

const userServiceMock = {
  login: jasmine.createSpy('login').and.returnValue(of({ message: 'welcome', token: 'token-123' })),
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
        { provide: UserStateService, useValue: { refresh: jasmine.createSpy('refresh') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });
});
