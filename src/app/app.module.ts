import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { SwiperModule } from 'swiper/angular';
import { Ng5SliderModule } from 'ng5-slider';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { SignupComponent } from './component/signup/signup.component';
import { HomeComponent } from './component/home/home.component';
import { NavbarComponent } from './component/navbar/navbar.component';
import { MaleComponent } from './component/male/male.component';
import { ProductsDetailsComponent } from './component/products-details/products-details.component';
import { AdminComponent } from './component/admin/admin.component';
import { UserService } from './services/user.service';
import { CartComponent } from './component/cart/cart.component';
import { AllproductComponent } from './component/allproduct/allproduct.component';
import { CartOnAllComponent } from './component/cart-on-all/cart-on-all.component';
import { ProductsService } from './services/products.service';
import { SharedService } from './services/shared.service';
import { OrdersComponent } from './component/orders/orders.component';
import { PersonalComponent } from './component/personal/personal.component';
import { FavoritesComponent } from './component/favorites/favorites.component';
import { SettingsComponent } from './component/settings/settings.component';
import { UserinfoComponent } from './component/userinfo/userinfo.component';
import { FooterComponent } from './component/footer/footer.component';
import { ResNavComponent } from './component/res-nav/res-nav.component';
import { BlogComponent } from './component/blog/blog.component';
import { YourStoreComponent } from './component/your-store/your-store.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SroteSettingComponent } from './component/srote-setting/srote-setting.component';
import { AddProductComponent } from './component/add-product/add-product.component';
import { ChatsComponent } from './component/chats/chats.component';
import { NgwWowModule } from 'ngx-wow';
import { CouponsComponent } from './component/coupons/coupons.component';
import { CategoryComponent } from './component/category/category.component';
import { SupCategoryComponent } from './component/sup-category/sup-category.component';
import { BrandComponent } from './component/brand/brand.component';
import { AdminsControlComponent } from './component/admins-control/admins-control.component';
import { LoadingComponent } from './component/loading/loading.component';
import { FilterBtnComponent } from './component/btn/filter-btn/filter-btn.component';
import { SearchBtnComponent } from './component/btn/search-btn/search-btn.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginFirstComponent } from './component/login-first/login-first.component';
import { CreateYourStoreComponent } from './component/create-your-store/create-your-store.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,
    NavbarComponent,
    MaleComponent,
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
    FooterComponent,
    ResNavComponent,
    BlogComponent,
    YourStoreComponent,
    SroteSettingComponent,
    AddProductComponent,
    CouponsComponent,
    CategoryComponent,
    SupCategoryComponent,
    BrandComponent,
    AdminsControlComponent,
    LoadingComponent,
    FilterBtnComponent,
    SearchBtnComponent,
    ChatsComponent,
    LoginFirstComponent,
    CreateYourStoreComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    CarouselModule,
    Ng5SliderModule,
    SwiperModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MaterialFileInputModule,
    DragDropModule,
    NgwWowModule,
  ],

  providers: [UserService, ProductsService, SharedService],
  bootstrap: [AppComponent],
})
export class AppModule {}
