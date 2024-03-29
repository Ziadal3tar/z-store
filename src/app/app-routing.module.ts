import { AddProductComponent } from './component/add-product/add-product.component';
import { LogoutGuard } from './services/logout.guard';
import { YourStoreComponent } from './component/your-store/your-store.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FooterComponent } from './component/footer/footer.component';
import { UserinfoComponent } from './component/userinfo/userinfo.component';
import { PersonalComponent } from './component/personal/personal.component';
import { FavoritesComponent } from './component/favorites/favorites.component';
import { SettingsComponent } from './component/settings/settings.component';
import { OrdersComponent } from './component/orders/orders.component';
import { CartOnAllComponent } from './component/cart-on-all/cart-on-all.component';
import { AllproductComponent } from './component/allproduct/allproduct.component';
import { CartComponent } from './component/cart/cart.component';
import { LogingurdGuard } from './services/logingurd.guard';
import { LoginComponent } from './component/login/login.component';
import { AdminComponent } from './component/admin/admin.component';
import { SignupComponent } from './component/signup/signup.component';
import { HomeComponent } from './component/home/home.component';
import { MaleComponent } from './component/male/male.component';
import { ProductsDetailsComponent } from './component/products-details/products-details.component';
import { BlogComponent } from './component/blog/blog.component';
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login',canActivate: [LogoutGuard], component: LoginComponent },
  { path: 'male', component: MaleComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'all', component: AllproductComponent },
  { path: 'userinfo/settings', canActivate: [LogingurdGuard], component: UserinfoComponent },
  { path: 'userinfo/orders', canActivate: [LogingurdGuard], component: UserinfoComponent },
  { path: 'userinfo/settings', canActivate: [LogingurdGuard], component: UserinfoComponent },
  { path: 'userinfo/favorites', canActivate: [LogingurdGuard], component: UserinfoComponent },
  { path: 'userinfo/personal', canActivate: [LogingurdGuard], component: UserinfoComponent },
  { path: 'productDetails/:id', component: ProductsDetailsComponent },
  { path: 'signup',canActivate: [LogoutGuard], component: SignupComponent },
  { path: 'admin', canActivate: [LogingurdGuard], component: AdminComponent },
  { path: 'addProduct', canActivate: [LogingurdGuard], component: AddProductComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'cart', canActivate: [LogingurdGuard], component: CartComponent },
  { path: 'footer', canActivate: [LogingurdGuard], component: FooterComponent },
  { path: 'yourStore/:id', canActivate: [LogingurdGuard], component: YourStoreComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule],
})
export class AppRoutingModule { }
