import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoresRoutingModule } from './stores-routing.module';
import { StorefrontComponent } from './pages/storefront/storefront.component';
import { StoreDashboardComponent } from './pages/store-dashboard/store-dashboard.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ImageUploaderComponent } from './components/image-uploader/image-uploader.component';
import { OrdersListComponent } from './components/orders-list/orders-list.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    StorefrontComponent,
    StoreDashboardComponent,
    ProductFormComponent,
    ProductsListComponent,
    ProductCardComponent,
    ImageUploaderComponent,
    OrdersListComponent
  ],
  imports: [
    CommonModule,
    StoresRoutingModule,
    ReactiveFormsModule
  ]
})
export class StoresModule { }
