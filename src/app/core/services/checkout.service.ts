import { Injectable } from '@angular/core';
import { CheckoutDraft } from '../models/checkout.model';

const STORAGE_KEY = 'zstore_checkout_draft';
const CART_CONTEXT_KEY = 'zstore_checkout_cart_context';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  saveCartContext(context: { subtotal: number; discount: number; coupon?: string }): void {
    sessionStorage.setItem(CART_CONTEXT_KEY, JSON.stringify(context));
  }

  getCartContext(): { subtotal: number; discount: number; coupon?: string } | null {
    const raw = sessionStorage.getItem(CART_CONTEXT_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(CART_CONTEXT_KEY);
      return null;
    }
  }

  saveDraft(draft: CheckoutDraft): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }

  getDraft(): CheckoutDraft | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as CheckoutDraft;
    } catch {
      this.clearDraft();
      return null;
    }
  }

  clearDraft(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(CART_CONTEXT_KEY);
  }
}
