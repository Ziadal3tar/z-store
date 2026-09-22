import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { SignupComponent } from './component/signup/signup.component';
import { HomeComponent } from './component/home/home.component';
import { NavbarComponent } from './component/navbar/navbar.component';
import { ProductsDetailsComponent } from './component/products-details/products-details.component';
import { AdminComponent } from './component/admin/admin.component';
import { CartComponent } from './component/cart/cart.component';
import { AllproductComponent } from './component/allproduct/allproduct.component';
import { CartOnAllComponent } from './component/cart-on-all/cart-on-all.component';
import { OrdersComponent } from './component/orders/orders.component';
import { PersonalComponent } from './component/personal/personal.component';
import { FavoritesComponent } from './component/favorites/favorites.component';
import { SettingsComponent } from './component/settings/settings.component';
import { UserinfoComponent } from './component/userinfo/userinfo.component';

import { ResNavComponent } from './component/res-nav/res-nav.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddProductComponent } from './component/add-product/add-product.component';
import { CouponsComponent } from './component/coupons/coupons.component';
import { CategoryComponent } from './component/category/category.component';
import { SupCategoryComponent } from './component/sup-category/sup-category.component';
import { BrandComponent } from './component/brand/brand.component';
import { AdminsControlComponent } from './component/admins-control/admins-control.component';
import { LoadingComponent } from './component/loading/loading.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginFirstComponent } from './component/login-first/login-first.component';
import { CreateYourStoreComponent } from './component/create-your-store/create-your-store.component';
import { CheckoutComponent } from './component/checkout/checkout.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ApiErrorInterceptor } from './core/interceptors/api-error.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,
    NavbarComponent,
    ProductsDetailsComponent,
    AdminComponent,
    CartComponent,
    AllproductComponent,
    CartOnAllComponent,
    OrdersComponent,
    PersonalComponent,
    FavoritesComponent,
    SettingsComponent,
    UserinfoComponent,
    // FooterComponent,
    ResNavComponent,
    AddProductComponent,
    CouponsComponent,
    CategoryComponent,
    SupCategoryComponent,
    BrandComponent,
    AdminsControlComponent,
    LoadingComponent,
    LoginFirstComponent,
    CreateYourStoreComponent,
    CheckoutComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DragDropModule,
  ],

  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ApiErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
