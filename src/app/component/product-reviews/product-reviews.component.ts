import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ProductReview } from '../../core/models/review.model';
import { ReviewService } from '../../core/services/review.service';
interface ReviewView extends ProductReview { avatarLabel: string; filledStars: string; emptyStars: string; }

@Component({
  selector: 'app-product-reviews',
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ProductReviewsComponent implements OnChanges, OnDestroy {
@Input() productId = '';
  @Input() isAuthenticated = false;
  @Input() pendingOrderId = '';

  reviews: ReviewView[] = [];
  average = 0;
  total = 0;
  rating = 5;
  comment = '';
  busy = false;
  error = '';
  success = '';
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly reviewsService: ReviewService, private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId']?.currentValue) this.load();
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    if (!this.productId) return;
    this.reviewsService.getProductReviews(this.productId).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => { this.reviews = (response.reviews || []).map(review => ({ ...review, avatarLabel: review.userId?.userName?.charAt(0) || 'U', filledStars: '★'.repeat(review.rating), emptyStars: '★'.repeat(5 - review.rating) })); this.average = response.average || 0; this.total = response.total || 0; this.cdr.markForCheck(); },
      error: () => this.cdr.markForCheck(),
    });
  }

  submit(): void {
    this.error = ''; this.success = '';
    if (!this.isAuthenticated) { this.error = 'Sign in to leave a review.'; return; }
    if (!this.pendingOrderId) { this.error = 'A delivered order is required before you can review this product.'; return; }
    if (this.comment.trim().length < 3) { this.error = 'Please write a short review.'; return; }
    this.busy = true;
    this.reviewsService.createReview({ productId: this.productId, orderId: this.pendingOrderId, rating: this.rating, comment: this.comment.trim() }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.busy = false; this.comment = ''; this.success = 'Review published.'; this.load(); },
      error: error => { this.busy = false; this.error = error?.error?.message || 'Unable to publish your review.'; this.cdr.markForCheck(); },
    });
  }

  helpful(review: ProductReview): void {
    this.reviewsService.markHelpful(review._id).pipe(takeUntil(this.destroy$)).subscribe({ next: () => { review.helpfulCount = (review.helpfulCount || 0) + 1; this.cdr.markForCheck(); } });
  }

  trackByReview(_: number, review: ProductReview): string { return review._id; }
}
