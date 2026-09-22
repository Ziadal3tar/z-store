import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreDashboardComponent } from './pages/store-dashboard/store-dashboard.component';
import { StorefrontComponent } from './pages/storefront/storefront.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { OrdersListComponent } from './components/orders-list/orders-list.component';
import { LogingurdGuard } from '../services/logingurd.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'create',
    pathMatch: 'full',
  },
  {
    path: 'create',
    component: StorefrontComponent,
    data: { title: 'Create your store' },
  },
  {
    path: ':id/admin',
    component: StoreDashboardComponent,
    canActivate: [LogingurdGuard],
    canActivateChild: [LogingurdGuard],
    data: { title: 'Store dashboard' },
    children: [
      {
        path: 'products',
        component: ProductsListComponent,
        data: { title: 'Products management' },
      },
      {
        path: 'products/new',
        component: ProductFormComponent,
        data: { title: 'Add product' },
      },
      {
        path: 'products/:productId/edit',
        component: ProductFormComponent,
        data: { title: 'Edit product' },
      },
      {
        path: 'orders',
        component: OrdersListComponent,
        data: { title: 'Orders management' },
      },
    ],
  },
  {
    path: ':id',
    component: StorefrontComponent,
    data: { title: 'Store' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoresRoutingModule {}
