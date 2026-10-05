import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { LoginComponent } from './component/login/login.component';
import { AdminDashboardComponent } from './component/admin-dashboard/admin-dashboard.component';
import { SignupComponent } from './component/signup/signup.component';
import { HomeComponent } from './component/home/home.component';
import { ShopComponent } from './component/shop/shop.component';
import { CartComponent } from './component/cart/cart.component';
import { AccountComponent } from './component/account/account.component';
import { ProductDetailsComponent } from './component/product-details/product-details.component';
import { CheckoutComponent } from './component/checkout/checkout.component';
import { BlogPageComponent } from './component/blog-page/blog-page.component';
import { ContactPageComponent } from './component/contact-page/contact-page.component';
import { ProductCompareComponent } from './component/product-compare/product-compare.component';
import { OrderDetailsComponent } from './component/order-details/order-details.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Home', description: 'Discover featured products, new arrivals and offers on Z-Store.' },
  },
  {
    path: 'blog',
    component: BlogPageComponent,

  },
  {
    path: 'contact',
    component: ContactPageComponent,

  },
  { path: 'login', canActivate: [GuestGuard], component: LoginComponent, data: { title: 'Login' } },
  {
    path: 'shop',
    component: ShopComponent,
    data: { title: 'Shop', description: 'Browse products with search, filtering and sorting on Z-Store.' },
  },
  { path: 'product/:id', component: ProductDetailsComponent, data: { title: 'Product' } },
  { path: 'orders/:id', canActivate: [AuthGuard], component: OrderDetailsComponent, data: { title: 'Order tracking' } },
  { path: 'compare', component: ProductCompareComponent, data: { title: 'Compare products' } },
  { path: 'account', canActivate: [AuthGuard], component: AccountComponent, data: { title: 'Account' } },
  { path: 'account/settings', canActivate: [AuthGuard], component: AccountComponent, data: { title: 'Settings' } },
  { path: 'account/orders', canActivate: [AuthGuard], component: AccountComponent, data: { title: 'Orders' } },
  { path: 'account/wishlist', canActivate: [AuthGuard], component: AccountComponent, data: { title: 'Wishlist' } },
  { path: 'account/profile', canActivate: [AuthGuard], component: AccountComponent, data: { title: 'Profile' } },
  { path: 'userinfo/settings', redirectTo: 'account/settings' },
  { path: 'userinfo/orders', redirectTo: 'account/orders' },
  { path: 'userinfo/favorites', redirectTo: 'account/wishlist' },
  { path: 'userinfo/personal', redirectTo: 'account/profile' },
  { path: 'allproducts', redirectTo: 'shop' },
  { path: 'Shop', redirectTo: 'shop' },
  { path: 'Blog', redirectTo: 'blog' },
  { path: 'Contact', redirectTo: 'contact' },
  { path: 'signup', canActivate: [GuestGuard], component: SignupComponent, data: { title: 'Create account' } },
  { path: 'admin', canActivate: [AuthGuard, AdminGuard], component: AdminDashboardComponent, data: { title: 'Admin' } },
  { path: 'cart', canActivate: [AuthGuard], component: CartComponent, data: { title: 'Cart' } },
  { path: 'checkout', canActivate: [AuthGuard], component: CheckoutComponent, data: { title: 'Checkout' } },
  {
    path: 'store',
    loadChildren: () => import('./stores/stores.module').then(m => m.StoresModule),
  },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
