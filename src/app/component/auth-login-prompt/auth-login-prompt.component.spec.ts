import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthLoginPromptComponent } from './auth-login-prompt.component';

describe('AuthLoginPromptComponent', () => {
  let component: AuthLoginPromptComponent;
  let fixture: ComponentFixture<AuthLoginPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthLoginPromptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthLoginPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
