import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { RecentlyViewedService } from './recently-viewed.service';

@Injectable({ providedIn: 'root' })
export class ProductViewService {
  constructor(private readonly recentlyViewed: RecentlyViewedService) {}
  add(product: Product): void { this.recentlyViewed.add(product); }
  get(): Product[] { return this.recentlyViewed.get(); }
}
