import { getAuthToken } from 'src/app/core/auth-token.util';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CheckoutService } from '../../core/services/checkout.service';
import {
  CheckoutAddress,
  PaymentMethod,
  ShippingMethod,
} from '../../core/models/checkout.model';
import { User } from 'src/app/core/models/user.model';
import { UserStateService } from 'src/app/core/state/user-state.service';

interface CheckoutItem {
  quantity: number;
  productId: {
    _id: string;
    name: string;
    finalPrice: number;
    images?: Array<string | { url: string }>;
  };
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  checkoutForm!: FormGroup;
  userData: User | undefined;
  items: CheckoutItem[] = [];
  subtotal = 0;
  discount = 0;
  shippingFee = 0;
  total = 0;
  selectedShipping: ShippingMethod = 'standard';
  selectedPayment: PaymentMethod = 'cash-on-delivery';
  coupon = '';
  showApiNotice = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly userStateService: UserStateService,
    private readonly checkoutService: CheckoutService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(60)]],
      lastName: ['', [Validators.required, Validators.maxLength(60)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-()\s]{8,20}$/)]],
      country: ['Egypt', Validators.required],
      city: ['', [Validators.required, Validators.maxLength(80)]],
      postalCode: ['', [Validators.maxLength(20)]],
      street: ['', [Validators.required, Validators.maxLength(120)]],
      building: ['', [Validators.maxLength(30)]],
      apartment: ['', [Validators.maxLength(30)]],
      note: ['', [Validators.maxLength(500)]],
    });

    this.subscriptions.add(
      this.userStateService.user$.subscribe((user) => {
        this.userData = user;
        this.items = Array.isArray(user?.cartId?.products)
          ? this.toCheckoutItems(user?.cartId?.products ?? [])
          : [];
        this.prefillUserData(user);
        this.recalculate();
        this.cdr.markForCheck();
      }),
    );

    if (!getAuthToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.userStateService.refresh();

    const cartContext = this.checkoutService.getCartContext();
    if (cartContext) {
      this.discount = Number(cartContext.discount || 0);
      this.coupon = cartContext.coupon || '';
    }

    this.recalculate();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  imageUrl(item: CheckoutItem): string {
    const image = item.productId?.images?.[0];
    if (typeof image === 'string') return image;
    return image?.url || 'assets/placeholder.png';
  }

  lineTotal(item: CheckoutItem): number {
    return Number(item.productId?.finalPrice || 0) * Number(item.quantity || 0);
  }

  selectShipping(method: ShippingMethod): void {
    this.selectedShipping = method;
    this.recalculate();
  }

  selectPayment(method: PaymentMethod): void {
    this.selectedPayment = method;
  }

  recalculate(): void {
    this.subtotal = this.items.reduce((sum, item) => sum + this.lineTotal(item), 0);
    this.shippingFee = this.selectedShipping === 'express' ? 120 : (this.subtotal > 1500 ? 0 : 60);
    this.total = Math.max(0, this.subtotal - this.discount + this.shippingFee);
  }

  submit(): void {
    this.checkoutForm.markAllAsTouched();
    if (this.checkoutForm.invalid || !this.items.length) {
      this.cdr.markForCheck();
      return;
    }

    const address = this.checkoutForm.value as CheckoutAddress;

    this.checkoutService.saveDraft({
      address,
      shippingMethod: this.selectedShipping,
      paymentMethod: this.selectedPayment,
      subtotal: this.subtotal,
      discount: this.discount,
      shippingFee: this.shippingFee,
      total: this.total,
      coupon: this.coupon || undefined,
      createdAt: new Date().toISOString(),
    });

    this.showApiNotice = true;
    this.cdr.markForCheck();
  }

  backToCart(): void {
    this.router.navigate(['/cart']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.checkoutForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  trackByProduct(index: number, item: CheckoutItem): string | number {
    return item.productId?._id || index;
  }

  private prefillUserData(user: User | undefined): void {
    if (!user) return;

    const firstName = user.userName || '';
    this.checkoutForm.patchValue({
      firstName,
      lastName: '',
      phone: user.phone || '',
      country: user.country || 'Egypt',
      city: user.city || '',
      postalCode: user.postalCode || user.postCode || '',
      street: user.street || '',
      building: user.building || '',
      apartment: user.apartment || '',
    }, { emitEvent: false });
  }

  private toCheckoutItems(items: NonNullable<User['cartId']>['products']): CheckoutItem[] {
    if (!items) return [];

    return items
      .filter((item) => !!item.productId?._id)
      .map((item) => ({
        quantity: Number(item.quantity ?? 0),
        productId: {
          _id: item.productId?._id ?? '',
          name: item.productId?.name ?? '',
          finalPrice: Number(item.productId?.finalPrice ?? item.productId?.price ?? 0),
          images: item.productId?.images,
        },
      }));
  }
}
