import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Product } from 'src/app/core/models/product.model';
import { BrandsService } from 'src/app/services/brands.service';
import { CategoryService } from 'src/app/services/category.service';
import {
  ProductListResponse,
  ProductsService,
} from 'src/app/services/products.service';
import { SubCategoriesService } from 'src/app/services/sub-categories.service';

export interface CatalogRelation {
  _id?: string;
  name?: string;
}

export interface CatalogItem {
  _id?: string;
  name?: string;
  image?: string;
  categoryId?: CatalogRelation;
  createdBy?: { userName?: string };
  updatedBy?: { userName?: string };
  deletedBy?: { userName?: string };
}

@Injectable({
  providedIn: 'root',
})
export class CatalogStateService {
  private readonly productsSubject = new BehaviorSubject<Product[]>([]);
  private readonly categoriesSubject = new BehaviorSubject<CatalogItem[]>([]);
  private readonly subCategoriesSubject = new BehaviorSubject<CatalogItem[]>([]);
  private readonly brandsSubject = new BehaviorSubject<CatalogItem[]>([]);
private readonly productPaginationSubject =
  new BehaviorSubject<ProductListResponse>({
    message: '',
    products: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  readonly products$ = this.productsSubject.asObservable();
  readonly categories$ = this.categoriesSubject.asObservable();
  readonly subCategories$ = this.subCategoriesSubject.asObservable();
  readonly brands$ = this.brandsSubject.asObservable();
readonly productPagination$ =
  this.productPaginationSubject.asObservable();
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoryService: CategoryService,
    private readonly subCategoriesService: SubCategoriesService,
    private readonly brandsService: BrandsService,
  ) {}

  get products(): Product[] {
    return this.productsSubject.value;
  }

  get categories(): CatalogItem[] {
    return this.categoriesSubject.value;
  }

  get subCategories(): CatalogItem[] {
    return this.subCategoriesSubject.value;
  }

  get brands(): CatalogItem[] {
    return this.brandsSubject.value;
  }

refreshProducts(
  page = 1,
  limit = 12,
  search = ''
): void {
  this.productsService
    .getProduct(page, limit, search)
    .subscribe({
      next: (response) => {
        console.log(response);

        this.productPaginationSubject.next(response);

        this.productsSubject.next(
          response.products ?? []
        );
      },

      error: (error) => {
        console.error(
          'Load products failed:',
          error
        );

        this.productsSubject.next([]);

        this.productPaginationSubject.next({
          message: '',
          products: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: page > 1,
        });
      },
    });
}

  refreshCategories(): void {
    this.categoryService.allCategory().subscribe({
      next:  (response: any) => {
        this.categoriesSubject.next(response.categories ?? []);
      },
    });
  }

  refreshSubCategories(): void {
    this.subCategoriesService.allSubCategory().subscribe({
      next:  (response: any) => {
        this.subCategoriesSubject.next(response.allSubCategories ?? []);
      },
    });
  }

  refreshBrands(): void {
    this.brandsService.allBrands().subscribe({
      next:  (response: any) => {
        this.brandsSubject.next(response.brands ?? []);
      },
    });
  }

  refreshAll(): void {
    this.refreshProducts();
    this.refreshCategories();
    this.refreshSubCategories();
    this.refreshBrands();
  }

  clear(): void {
    this.productsSubject.next([]);
    this.productPaginationSubject.next({
  message: '',
  products: [],
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
});
    this.categoriesSubject.next([]);
    this.subCategoriesSubject.next([]);
    this.brandsSubject.next([]);
  }
}
