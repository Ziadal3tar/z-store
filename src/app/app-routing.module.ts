import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogingurdGuard } from './services/logingurd.guard';
import { LogoutGuard } from './services/logout.guard';
import { LoginComponent } from './component/login/login.component';
import { AdminComponent } from './component/admin/admin.component';
import { SignupComponent } from './component/signup/signup.component';
import { HomeComponent } from './component/home/home.component';
import { AllproductComponent } from './component/allproduct/allproduct.component';
import { CartComponent } from './component/cart/cart.component';
import { UserinfoComponent } from './component/userinfo/userinfo.component';
import { ProductsDetailsComponent } from './component/products-details/products-details.component';
import { CheckoutComponent } from './component/checkout/checkout.component';
import { BlogComponent } from './component/blog/blog.component';
import { ContactComponent } from './component/contact/contact.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Home', description: 'Discover featured products, new arrivals and offers on Z-Store.' },
  },
  {
    path: 'Blog',
    component: BlogComponent,

  },
  {
    path: 'Contact',
    component: ContactComponent,

  },
  { path: 'login', canActivate: [LogoutGuard], component: LoginComponent, data: { title: 'Login' } },
  {
    path: 'shop',
    component: AllproductComponent,
    data: { title: 'Shop', description: 'Browse products with search, filtering and sorting on Z-Store.' },
  },
  { path: 'product/:id', component: ProductsDetailsComponent, data: { title: 'Product' } },
  { path: 'Shop', redirectTo: 'shop', pathMatch: 'full' },
  { path: 'userinfo/settings', canActivate: [LogingurdGuard], component: UserinfoComponent, data: { title: 'Settings' } },
  { path: 'userinfo/orders', canActivate: [LogingurdGuard], component: UserinfoComponent, data: { title: 'Orders' } },
  { path: 'userinfo/favorites', canActivate: [LogingurdGuard], component: UserinfoComponent, data: { title: 'Favorites' } },
  { path: 'userinfo/personal', canActivate: [LogingurdGuard], component: UserinfoComponent, data: { title: 'Account' } },
  { path: 'signup', canActivate: [LogoutGuard], component: SignupComponent, data: { title: 'Create account' } },
  { path: 'admin', canActivate: [LogingurdGuard], component: AdminComponent, data: { title: 'Admin' } },
  { path: 'cart', canActivate: [LogingurdGuard], component: CartComponent, data: { title: 'Cart' } },
  { path: 'checkout', canActivate: [LogingurdGuard], component: CheckoutComponent, data: { title: 'Checkout' } },
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
