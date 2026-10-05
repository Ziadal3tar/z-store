import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CompareService } from '../../core/services/compare.service';
import { Product } from '../../core/models/product.model';
import { SeoService } from '../../core/services/seo.service';
interface CompareView extends Product { imageUrl: string; displayPrice: number; colorsText: string; sizesText: string; }

@Component({
  selector: 'app-product-compare',
  templateUrl: './product-compare.component.html',
  styleUrls: ['./product-compare.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ProductCompareComponent implements OnInit, OnDestroy {
  products: CompareView[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly compareService: CompareService,
    private readonly router: Router,
    private readonly seo: SeoService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.seo.setPage('Compare products', 'Compare products side by side on Z-Store.');
    this.compareService.products$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      this.products = products.map(product => { const image = product.images?.[0]; return { ...product, imageUrl: typeof image === 'string' ? image : image?.url || 'assets/placeholder.png', displayPrice: Number(product.displayFinalPrice ?? product.finalPrice ?? product.price ?? 0), colorsText: product.colors?.join(', ') || '—', sizesText: product.sizes?.join(', ') || '—' }; });
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  remove(id?: string): void { if (id) this.compareService.remove(id); }
  clear(): void { this.compareService.clear(); }
  view(product: Product): void { if (product._id) this.router.navigate(['/product', product._id]); }

}
