import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ProductReviewsComponent } from './product-reviews.component';

describe('ProductReviewsComponent', () => {
  let fixture: ComponentFixture<ProductReviewsComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [ProductReviewsComponent], imports: [FormsModule] }).compileComponents();
    fixture = TestBed.createComponent(ProductReviewsComponent);
    fixture.componentInstance.productId = '1';
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
