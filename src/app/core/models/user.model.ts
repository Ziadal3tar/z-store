import { Cart } from './cart.model';
import { Product } from './product.model';

export interface StoreReference {
  _id?: string;
  name?: string;
  slug?: string;
}

export interface UserAddress {
  country?: string;
  city?: string;
  postCode?: string;
  postalCode?: string;
  street?: string;
  house?: string;
  building?: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  comment?: string;
}

export interface User {
  _id?: string;

  userName: string;
  email: string;
  phone?: string;

  profilePic?: string;
  image?: string;

  role?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  isVerified?: boolean;

  wishlist?: Product[];
  cartId?: Cart;

  storeId?: string;
  store?: StoreReference | null;

  dateOfBirth?: string;
  birthDate?: string;

  country?: string;
  city?: string;
  postCode?: string;
  postalCode?: string;
  street?: string;
  house?: string;
  building?: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  comment?: string;

  createdAt?: string;
  updatedAt?: string;
}

/**
 * Response returned by /auth/getUser/:token in the current project.
 * `userData` is kept optional for compatibility with older code paths.
 */
export interface UserDataResponse {
  user: User;
  userData?: User;
  message?: string;
}

export interface AuthResponse {
  message?: string;
  token?: string;
}

export interface SignUpPayload {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  type?: string;
  email?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  userName?: string;
  phone?: string;
  dateOfBirth?: string;
  birthDate?: string;
  country?: string;
  city?: string;
  postCode?: string;
  postalCode?: string;
  street?: string;
  house?: string;
  building?: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  comment?: string;
  [key: string]: unknown;
}

export interface SearchUserPayload {
  name: string;
}

export interface UserListResponse {
  users?: User[];
  allUser?: User[];
  message?: string;
}

export interface AdminListResponse {
  admins: User[];
  message?: string;
}

export interface SearchUserResponse {
  allUser: User[];
  message?: string;
}

export interface UserActionResponse {
  message?: string;
  user?: User;
  updateUser?: User;
}
