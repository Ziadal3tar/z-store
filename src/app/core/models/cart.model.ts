import { Product } from './product.model';

/**
 * Populated cart item returned by the user/cart endpoints.
 */
export interface CartItem {
  _id?: string;
  productId: Product;
  quantity: number;
}

/**
 * Lightweight cart item shape used by some cart endpoints/tests.
 */
export interface CartItemReference {
  _id?: string;
  productId: string | Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  userId?: string;

  /** Populated cart representation used by the user object. */
  products: CartItem[];

  /** Alternative response representation used by the cart endpoint. */
  items?: CartItemReference[];

  subtotal?: number;
  discountAmount?: number;
  totalPrice?: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
}

export type RemoveFromCartPayload = string | {
  productId?: string;
  userId?: string;
};

export interface UpdateCartQuantityPayload {
  index: number;
  productId: string;
  quantity: number;
}

export interface CartState {
  cart: Cart | null;
}
