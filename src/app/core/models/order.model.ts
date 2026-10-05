export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  sku?: string;
  storeId?: string;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  postalCode?: string;
  street: string;
  building?: string;
  apartment?: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  storeId?: string;
  items: OrderItem[];
  address: OrderAddress;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: string;
  status: OrderStatus;
  payment: {
    method: 'cash-on-delivery' | 'card';
    status: 'pending' | 'paid' | 'failed';
  };
  loyaltyAwarded?: boolean;
  createdAt: string;
  updatedAt: string;
}
