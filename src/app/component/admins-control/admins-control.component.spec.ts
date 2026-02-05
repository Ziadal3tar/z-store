import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminsControlComponent } from './admins-control.component';

describe('AdminsControlComponent', () => {
  let component: AdminsControlComponent;
  let fixture: ComponentFixture<AdminsControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminsControlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminsControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
