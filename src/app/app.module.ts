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
import { SiteHeaderComponent } from './component/site-header/site-header.component';
import { ProductDetailsComponent } from './component/product-details/product-details.component';
import { AdminDashboardComponent } from './component/admin-dashboard/admin-dashboard.component';
import { CartComponent } from './component/cart/cart.component';
import { ShopComponent } from './component/shop/shop.component';
import { CartDrawerComponent } from './component/cart-drawer/cart-drawer.component';
import { OrderHistoryComponent } from './component/order-history/order-history.component';
import { AccountProfileComponent } from './component/account-profile/account-profile.component';
import { WishlistComponent } from './component/wishlist/wishlist.component';
import { AccountSettingsComponent } from './component/account-settings/account-settings.component';
import { AccountComponent } from './component/account/account.component';

import { ResponsiveNavbarComponent } from './component/responsive-navbar/responsive-navbar.component';
import { ProductFormComponent } from './component/product-form/product-form.component';
import { CouponManagementComponent } from './component/coupon-management/coupon-management.component';
import { CategoryManagementComponent } from './component/category-management/category-management.component';
import { SubcategoryManagementComponent } from './component/subcategory-management/subcategory-management.component';
import { BrandManagementComponent } from './component/brand-management/brand-management.component';
import { UserManagementComponent } from './component/user-management/user-management.component';
import { LoadingSpinnerComponent } from './component/loading-spinner/loading-spinner.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthLoginPromptComponent } from './component/auth-login-prompt/auth-login-prompt.component';
import { CheckoutComponent } from './component/checkout/checkout.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ApiErrorInterceptor } from './core/interceptors/api-error.interceptor';
import { ContactPageComponent } from './component/contact-page/contact-page.component';
import { BlogPageComponent } from './component/blog-page/blog-page.component';
import { SiteFooterComponent } from './component/site-footer/site-footer.component';
import { ProductReviewsComponent } from './component/product-reviews/product-reviews.component';
import { AdminOverviewComponent } from './component/admin-overview/admin-overview.component';
import { AdminOrdersComponent } from './component/admin-orders/admin-orders.component';
import { OrderDetailsComponent } from './component/order-details/order-details.component';
import { ProductCompareComponent } from './component/product-compare/product-compare.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,
    SiteHeaderComponent,
    ProductDetailsComponent,
    AdminDashboardComponent,
    CartComponent,
    ShopComponent,
    CartDrawerComponent,
    OrderHistoryComponent,
    AccountProfileComponent,
    WishlistComponent,
    AccountSettingsComponent,
    AccountComponent,
    ResponsiveNavbarComponent,
    ProductFormComponent,
    CouponManagementComponent,
    CategoryManagementComponent,
    SubcategoryManagementComponent,
    BrandManagementComponent,
    UserManagementComponent,
    LoadingSpinnerComponent,
    AuthLoginPromptComponent,
    CheckoutComponent,
    ContactPageComponent,
    BlogPageComponent,
    ProductCompareComponent,
    ProductReviewsComponent,
    AdminOverviewComponent,
    AdminOrdersComponent,
    OrderDetailsComponent,
    SiteFooterComponent

  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    DragDropModule,

  ],

  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ApiErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
