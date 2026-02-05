import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateYourStoreComponent } from './create-your-store.component';

describe('CreateYourStoreComponent', () => {
  let component: CreateYourStoreComponent;
  let fixture: ComponentFixture<CreateYourStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateYourStoreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateYourStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
