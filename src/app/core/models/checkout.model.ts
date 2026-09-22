export type PaymentMethod = 'cash-on-delivery' | 'card';
export type ShippingMethod = 'standard' | 'express';

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  postalCode: string;
  street: string;
  building: string;
  apartment: string;
  note: string;
}

export interface CheckoutDraft {
  address: CheckoutAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  coupon?: string;
  createdAt: string;
}
