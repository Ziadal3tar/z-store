import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreDashboardComponent } from './pages/store-dashboard/store-dashboard.component';
import { StorefrontComponent } from './pages/storefront/storefront.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { StoreOrdersComponent } from './components/store-orders/store-orders.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { StoreOwnerGuard } from '../core/guards/store-owner.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/shop',
    pathMatch: 'full',
  },
  {
    path: ':id/admin',
    component: StoreDashboardComponent,
    canActivate: [AuthGuard, StoreOwnerGuard],
    canActivateChild: [AuthGuard],
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
        component: StoreOrdersComponent,
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
