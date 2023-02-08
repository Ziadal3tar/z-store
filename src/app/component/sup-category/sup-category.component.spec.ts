import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupCategoryComponent } from './sup-category.component';

describe('SupCategoryComponent', () => {
  let component: SupCategoryComponent;
  let fixture: ComponentFixture<SupCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
