import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoresRoutingModule } from './stores-routing.module';
import { StorefrontComponent } from './pages/storefront/storefront.component';
import { StoreDashboardComponent } from './pages/store-dashboard/store-dashboard.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { StoreOrdersComponent } from './components/store-orders/store-orders.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    StorefrontComponent,
    StoreDashboardComponent,
    ProductFormComponent,
    ProductsListComponent,
    StoreOrdersComponent
  ],
  imports: [
    CommonModule,
    StoresRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class StoresModule { }
