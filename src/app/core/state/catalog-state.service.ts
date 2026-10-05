import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Product } from 'src/app/core/models/product.model';
import { BrandsService } from 'src/app/core/services/brands.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { ProductListResponse, ProductsService } from 'src/app/core/services/products.service';
import { SubCategoriesService } from 'src/app/core/services/sub-categories.service';

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

export interface ProductCatalogFilters {
  category?: string;
  brand?: string;
  color?: string;
minPrice?: number | any;
  maxPrice?: number | any;
  sort?: string;
  inStockOnly?: boolean;
  minimumRating?: number;
}

const EMPTY_PAGINATION: ProductListResponse = {
  message: '',
  products: [],
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

@Injectable({ providedIn: 'root' })
export class CatalogStateService {
  private readonly productsSubject = new BehaviorSubject<Product[]>([]);
  private readonly categoriesSubject = new BehaviorSubject<CatalogItem[]>([]);
  private readonly subCategoriesSubject = new BehaviorSubject<CatalogItem[]>([]);
  private readonly brandsSubject = new BehaviorSubject<CatalogItem[]>([]);
  private readonly productPaginationSubject = new BehaviorSubject<ProductListResponse>(EMPTY_PAGINATION);

  readonly products$ = this.productsSubject.asObservable();
  readonly categories$ = this.categoriesSubject.asObservable();
  readonly subCategories$ = this.subCategoriesSubject.asObservable();
  readonly brands$ = this.brandsSubject.asObservable();
  readonly productPagination$ = this.productPaginationSubject.asObservable();

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
    search = '',
    filters: ProductCatalogFilters = {},
  ): void {
    this.productsService.getProducts({ page, limit, search, ...filters }).subscribe({
      next: response => {
        this.productPaginationSubject.next(response);
        this.productsSubject.next(response.products ?? []);
      },
      error: error => {
        console.error('Load products failed:', error);
        this.productsSubject.next([]);
        this.productPaginationSubject.next({
          ...EMPTY_PAGINATION,
          page,
          limit,
          hasPrevPage: page > 1,
        });
      },
    });
  }

  refreshCategories(): void {
    this.categoryService.allCategory().subscribe({
      next: response => this.categoriesSubject.next(response.categories ?? []),
    });
  }

  refreshSubCategories(): void {
    this.subCategoriesService.allSubCategory().subscribe({
      next: response => this.subCategoriesSubject.next(response.allSubCategories ?? []),
    });
  }

  refreshBrands(): void {
    this.brandsService.allBrands().subscribe({
      next: response => this.brandsSubject.next(response.brands ?? []),
    });
  }

  upsertBrand(brand: CatalogItem): void {
    const items = [...this.brandsSubject.value];
    const index = items.findIndex(item => item._id === brand._id);
    if (index >= 0) items[index] = { ...items[index], ...brand };
    else items.unshift(brand);
    this.brandsSubject.next(items);
  }

  removeBrand(id: string): void {
    this.brandsSubject.next(this.brandsSubject.value.filter(item => item._id !== id));
  }

  upsertCategory(category: CatalogItem): void {
    const items = [...this.categoriesSubject.value];
    const index = items.findIndex(item => item._id === category._id);
    if (index >= 0) items[index] = { ...items[index], ...category };
    else items.unshift(category);
    this.categoriesSubject.next(items);
  }

  removeCategory(id: string): void {
    this.categoriesSubject.next(this.categoriesSubject.value.filter(item => item._id !== id));
    this.subCategoriesSubject.next(
      this.subCategoriesSubject.value.filter(item => item.categoryId?._id !== id),
    );
  }

  upsertSubCategory(subCategory: CatalogItem): void {
    const items = [...this.subCategoriesSubject.value];
    const index = items.findIndex(item => item._id === subCategory._id);
    if (index >= 0) items[index] = { ...items[index], ...subCategory };
    else items.unshift(subCategory);
    this.subCategoriesSubject.next(items);
  }

  removeSubCategory(id: string): void {
    this.subCategoriesSubject.next(this.subCategoriesSubject.value.filter(item => item._id !== id));
  }

  refreshAll(): void {
    this.refreshProducts();
    this.refreshCategories();
    this.refreshSubCategories();
    this.refreshBrands();
  }

  clear(): void {
    this.productsSubject.next([]);
    this.productPaginationSubject.next({ ...EMPTY_PAGINATION });
    this.categoriesSubject.next([]);
    this.subCategoriesSubject.next([]);
    this.brandsSubject.next([]);
  }
}
