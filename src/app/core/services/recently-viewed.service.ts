import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

const STORAGE_KEY = 'zstore_recently_viewed';
const MAX_ITEMS = 6;

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  add(product: Product): void {
    const id = product?._id;
    if (!id) return;

    const current = this.get();
    const next = [product, ...current.filter(item => item._id !== id)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  get(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(item => item && item._id) : [];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
