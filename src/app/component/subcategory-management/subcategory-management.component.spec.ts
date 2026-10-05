import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcategoryManagementComponent } from './subcategory-management.component';

describe('SubcategoryManagementComponent', () => {
  let component: SubcategoryManagementComponent;
  let fixture: ComponentFixture<SubcategoryManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcategoryManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubcategoryManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
