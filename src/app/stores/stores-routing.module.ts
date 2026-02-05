import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreDashboardComponent } from './pages/store-dashboard/store-dashboard.component';
import { StorefrontComponent } from './pages/storefront/storefront.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductsListComponent } from './components/products-list/products-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'create',
    pathMatch: 'full'
  },

  // صفحة إنشاء المتجر
  {
    path: 'create',
    component: StorefrontComponent
  },

  // Storefront
  {
    path: ':id',
    component: StorefrontComponent
  },

  // Dashboard (admin)
  {
    path: ':id/admin',
    component: StoreDashboardComponent,
    children: [
      // Products list
      {
        path: 'products',
        component: ProductsListComponent
      },

      // Add product
      {
        path: 'products/new',
        component: ProductFormComponent
      },

      // Edit product
      {
        path: 'products/:productId/edit',
        component: ProductFormComponent
      },

      // Default child
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoresRoutingModule { }
