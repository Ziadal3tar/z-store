import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

const STORAGE_KEY = 'zstore_compare';
const MAX_ITEMS = 4;

@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly subject = new BehaviorSubject<Product[]>(this.read());
  readonly products$ = this.subject.asObservable();

  get products(): Product[] { return this.subject.value; }
  has(id?: string): boolean { return !!id && this.products.some(product => product._id === id); }

  toggle(product: Product): void {
    if (!product._id) return;
    const next = this.has(product._id)
      ? this.products.filter(item => item._id !== product._id)
      : [...this.products, product].slice(-MAX_ITEMS);
    this.persist(next);
  }

  remove(id: string): void { this.persist(this.products.filter(product => product._id !== id)); }
  clear(): void { this.persist([]); }

  private read(): Product[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(products: Product[]): void {
    this.subject.next(products);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
}
