import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject, combineLatest, takeUntil } from 'rxjs';

import { ProductsService } from '../../services/products.service';
import { CatalogStateService } from 'src/app/core/state/catalog-state.service';

interface CatalogItem {
  _id?: string;
  name?: string;
  categoryId?: {
    _id?: string;
    name?: string;
  };
}

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProductComponent
  implements OnInit, OnDestroy
{
Number(arg0: number):any {
throw new Error('Method not implemented.');
}
  @Input() allData: any;

  productadded: any;

  productImg: string[] = [];
  mainimg = '';

  files: File[] = [];

  name = '';
  description = '';

  price: number | null = null;
  sale: number | null = 0;
  quantity: number | null = null;

  categoryId = '';
  subCategoryId = '';
  brandId = '';
  gender = '';

  allCategories: CatalogItem[] = [];
  allSubCategories: CatalogItem[] = [];
  allBrands: CatalogItem[] = [];

  loading = false;
  add = false;

  private readonly destroy$ =
    new Subject<void>();

  private successTimer?: ReturnType<
    typeof setTimeout
  >;

  constructor(
    private readonly productsService: ProductsService,
    private readonly catalogState: CatalogStateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.catalogState.refreshCategories();
    this.catalogState.refreshSubCategories();
    this.catalogState.refreshBrands();

    combineLatest([
      this.catalogState.categories$,
      this.catalogState.subCategories$,
      this.catalogState.brands$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ([
          categories,
          subCategories,
          brands,
        ]: [
          CatalogItem[],
          CatalogItem[],
          CatalogItem[]
        ]) => {
          this.allCategories = Array.isArray(
            categories
          )
            ? categories
            : [];

          this.allSubCategories = Array.isArray(
            subCategories
          )
            ? subCategories
            : [];

          this.allBrands = Array.isArray(
            brands
          )
            ? brands
            : [];

          this.cdr.markForCheck();
        }
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }
  }

  get filteredSubCategories(): CatalogItem[] {
    if (!this.categoryId) {
      return [];
    }

    return this.allSubCategories.filter(
      (item) =>
        item?.categoryId?._id ===
        this.categoryId
    );
  }

  get selectedCategoryName(): string {
    return (
      this.allCategories.find(
        (item) =>
          item?._id === this.categoryId
      )?.name || ''
    );
  }

  get selectedSubCategoryName(): string {
    return (
      this.allSubCategories.find(
        (item) =>
          item?._id === this.subCategoryId
      )?.name || ''
    );
  }

  get selectedBrandName(): string {
    return (
      this.allBrands.find(
        (item) =>
          item?._id === this.brandId
      )?.name || ''
    );
  }

  get previewDiscount(): number {
    const value = Number(
      this.sale ?? 0
    );

    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.min(
      Math.max(Math.round(value), 0),
      100
    );
  }

  get finalPreviewPrice(): number {
    const basePrice = Number(
      this.price ?? 0
    );

    if (!Number.isFinite(basePrice)) {
      return 0;
    }

    return Math.max(
      0,
      basePrice *
        (1 - this.previewDiscount / 100)
    );
  }

  get canSubmit(): boolean {
    return (
      !!this.categoryId &&
      !!this.name.trim() &&
      Number(this.price) >= 0 &&
      this.price !== null &&
      Number(this.quantity) >= 0 &&
      this.quantity !== null
    );
  }

  onCategoryChange(
    categoryId: string
  ): void {
    this.categoryId = categoryId;

    const exists =
      this.allSubCategories.some(
        (item) =>
          item?._id ===
            this.subCategoryId &&
          item?.categoryId?._id ===
            categoryId
      );

    if (!exists) {
      this.subCategoryId = '';
    }

    this.cdr.markForCheck();
  }

  uploads(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const selectedFiles = Array.from(
      input.files || []
    );

    if (!selectedFiles.length) {
      return;
    }

    const imageFiles = selectedFiles.filter(
      (file) =>
        file.type.startsWith('image/')
    );

    if (!imageFiles.length) {
      input.value = '';
      return;
    }

    this.files = imageFiles;

    Promise.all(
      imageFiles.map(
        (file) =>
          new Promise<string>(
            (resolve, reject) => {
              const reader =
                new FileReader();

              reader.onload = () => {
                resolve(
                  String(
                    reader.result || ''
                  )
                );
              };

              reader.onerror =
                () => reject(
                  reader.error
                );

              reader.readAsDataURL(file);
            }
          )
      )
    )
      .then((images) => {
        this.productImg = images;
        this.mainimg =
          images[0] || '';

        this.cdr.markForCheck();
      })
      .catch((error) => {
        console.error(
          'Image preview failed:',
          error
        );
      });
  }

  selectPreview(image: string): void {
    this.mainimg = image;
    this.cdr.markForCheck();
  }

  async addProduct(): Promise<void> {
    if (this.loading) {
      return;
    }

    if (!this.categoryId) {
      window.alert(
        'Please select a category first'
      );
      return;
    }

    if (!this.name.trim()) {
      window.alert(
        'Please enter a product name'
      );
      return;
    }

    if (
      this.price === null ||
      Number(this.price) < 0
    ) {
      window.alert(
        'Please enter a valid price'
      );
      return;
    }

    if (
      this.quantity === null ||
      Number(this.quantity) < 0
    ) {
      window.alert(
        'Please enter a valid quantity'
      );
      return;
    }

    if (!this.files.length) {
      window.alert(
        'Please upload at least one product image'
      );
      return;
    }

    this.loading = true;
    this.add = false;
    this.cdr.markForCheck();

    const formData =
      new FormData();

    this.files.forEach((file) => {
      formData.append(
        'image',
        file
      );
    });

    formData.append(
      'name',
      this.name.trim()
    );

    formData.append(
      'description',
      this.description.trim()
    );

    formData.append(
      'price',
      String(this.price)
    );

    formData.append(
      'discount',
      String(this.previewDiscount)
    );

    formData.append(
      'totalItems',
      String(this.quantity)
    );

    formData.append(
      'gender',
      this.gender
    );

    if (this.subCategoryId) {
      formData.append(
        'subCategoryId',
        this.subCategoryId
      );
    }

    if (this.brandId) {
      formData.append(
        'brandId',
        this.brandId
      );
    }

    this.productsService
      .addproduct(
        formData,
        this.categoryId
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any) => {
          if (
            data?.message === 'Created'
          ) {
            this.catalogState.refreshProducts();

            this.showSuccess();
            this.resetForm();
          }

          this.loading = false;
          this.cdr.markForCheck();
        },

        error: (error: any) => {
          console.error(
            'Add product failed:',
            error
          );

          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  trackByImage(
    index: number,
    image: string
  ): string | number {
    return image || index;
  }

  trackById(
    index: number,
    item: CatalogItem
  ): string | number {
    return item?._id || index;
  }

  private showSuccess(): void {
    this.add = true;

    if (this.successTimer) {
      clearTimeout(
        this.successTimer
      );
    }

    this.successTimer =
      setTimeout(() => {
        this.add = false;
        this.cdr.markForCheck();
      }, 3500);
  }

  private resetForm(): void {
    this.productImg = [];
    this.files = [];
    this.mainimg = '';

    this.name = '';
    this.description = '';

    this.price = null;
    this.sale = 0;
    this.quantity = null;

    this.categoryId = '';
    this.subCategoryId = '';
    this.brandId = '';
    this.gender = '';
  }
}
