import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { BrandsService } from '../../../services/brands.service';
import { CategoryService } from '../../../services/category.service';
import { SubCategoriesService } from '../../../services/sub-categories.service';
import { ProductsService } from '../../services/products.service';

interface SelectOption {
  id: string;
  name: string;
  categoryId?: string;
}

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent implements OnInit, OnDestroy {
  storeId: string | null = null;
  form: FormGroup;
  images: File[] = [];
  newImagePreviews: string[] = [];
  existingImagePreviews: string[] = [];
  loading = false;
  loadingOptions = true;
  error = '';
  uploadError = '';
  isEditMode = false;
  productId: string | null = null;
  readonly MAX_IMAGES = 6;
  readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

  categories: SelectOption[] = [];
  subCategories: SelectOption[] = [];
  brands: SelectOption[] = [];

  private readonly subs = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly productsSvc: ProductsService,
    private readonly categorySvc: CategoryService,
    private readonly subCategorySvc: SubCategoriesService,
    private readonly brandSvc: BrandsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      description: ['', [Validators.maxLength(2000)]],
      price: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      totalItems: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null, Validators.required],
      subCategoryId: [null],
      brandId: [null],
      gender: ['All'],
      tags: [''],
      attributes: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.storeId = this.route.parent?.snapshot.paramMap.get('id') ?? null;
    this.productId = this.route.snapshot.paramMap.get('productId');
    this.isEditMode = !!this.productId;

    this.loadSelectOptions();
  }

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  get filteredSubCategories(): SelectOption[] {
    const categoryId = this.form.get('categoryId')?.value;
    if (!categoryId) return [];
    return this.subCategories.filter(item => !item.categoryId || item.categoryId === String(categoryId));
  }

  get imageCount(): number {
    return this.existingImagePreviews.length + this.images.length;
  }

  addAttribute(key = '', value = ''): void {
    this.attributes.push(this.fb.group({
      key: [key, Validators.maxLength(60)],
      value: [value, Validators.maxLength(160)],
    }));
    this.cdr.markForCheck();
  }

  removeAttribute(index: number): void {
    this.attributes.removeAt(index);
    this.cdr.markForCheck();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;

    this.uploadError = '';
    const availableSlots = this.MAX_IMAGES - this.imageCount;
    if (availableSlots <= 0) {
      this.uploadError = `You can upload up to ${this.MAX_IMAGES} images.`;
      this.cdr.markForCheck();
      return;
    }

    files.slice(0, availableSlots).forEach(file => {
      if (!this.allowedImageTypes.includes(file.type)) {
        this.uploadError = 'Only JPG, PNG, WEBP and AVIF images are supported.';
        return;
      }

      if (file.size > this.MAX_IMAGE_SIZE) {
        this.uploadError = `Each image must be smaller than ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB.`;
        return;
      }

      this.images.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.newImagePreviews.push(String(reader.result));
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    });

    if (files.length > availableSlots) {
      this.uploadError = `Only ${availableSlots} image slot${availableSlots === 1 ? '' : 's'} remaining.`;
    }

    this.cdr.markForCheck();
  }

  removeNewImage(index: number): void {
    this.images.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
    this.cdr.markForCheck();
  }

  private loadSelectOptions(): void {
    this.loadingOptions = true;
    this.cdr.markForCheck();

    this.subs.add(
      forkJoin({
        categories: this.categorySvc.allCategory(),
        subCategories: this.subCategorySvc.allSubCategory(),
        brands: this.brandSvc.allBrands(),
      }).subscribe({
        next: result => {
          this.categories = this.normalizeOptions(result.categories, 'category');
          this.subCategories = this.normalizeOptions(result.subCategories, 'subcategory');
          this.brands = this.normalizeOptions(result.brands, 'brand');
          this.loadingOptions = false;
          this.cdr.markForCheck();

          if (this.productId) {
            this.loadProductForEdit(this.productId);
          }
        },
        error: () => {
          this.loadingOptions = false;
          this.error = 'Could not load categories and brands. You can still review the form, but selection data is unavailable.';
          this.cdr.markForCheck();
        },
      }),
    );
  }

  private normalizeOptions(response: any, kind: string): SelectOption[] {
    const source = Array.isArray(response)
      ? response
      : response?.categories ?? response?.subCategories ?? response?.subCategory ?? response?.brands ?? response?.data ?? [];

    return (Array.isArray(source) ? source : [])
      .map((item: any) => ({
        id: String(item?._id ?? item?.id ?? ''),
        name: String(item?.name ?? item?.title ?? ''),
        categoryId: kind === 'subcategory'
          ? String(item?.categoryId?._id ?? item?.categoryId?.id ?? item?.categoryId ?? '') || undefined
          : undefined,
      }))
      .filter((item: SelectOption) => item.id && item.name);
  }

  private loadProductForEdit(productId: string): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.subs.add(
      this.productsSvc.getProduct(productId).subscribe({
        next: (response: any) => {
          const product = response?.product;
          if (!product) {
            this.error = 'Product not found.';
            this.loading = false;
            this.cdr.markForCheck();
            return;
          }

          this.form.patchValue({
            name: product.name ?? '',
            description: product.description ?? '',
            price: Number(product.price ?? 0),
            discount: Number(product.discount ?? 0),
            totalItems: Number(product.totalItems ?? product.stock ?? 0),
            categoryId: this.extractId(product.categoryId ?? product.category),
            subCategoryId: this.extractId(product.subCategoryId ?? product.subCategory),
            brandId: this.extractId(product.brandId ?? product.brand),
            gender: product.gender ?? 'All',
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : String(product.tags ?? ''),
          });

          this.attributes.clear();
          if (Array.isArray(product.attributes)) {
            product.attributes.forEach((attr: any) => this.addAttribute(attr?.key ?? '', attr?.value ?? ''));
          }

          this.existingImagePreviews = Array.isArray(product.images)
            ? product.images.map((image: any) => typeof image === 'string' ? image : image?.url).filter(Boolean)
            : [];

          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.error = 'Failed to load product data.';
          this.cdr.markForCheck();
        },
      }),
    );
  }

  private extractId(value: any): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return value?._id ?? value?.id ?? null;
  }

  submit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please complete the required fields and fix invalid values.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.isEditMode && this.images.length === 0) {
      this.error = 'Add at least one product image.';
      this.cdr.markForCheck();
      return;
    }

    if (this.loading) return;

    this.loading = true;
    this.cdr.markForCheck();

    const value = this.form.getRawValue();
    const fd = new FormData();
    fd.append('name', String(value.name).trim());
    fd.append('description', String(value.description ?? '').trim());
    fd.append('price', String(value.price));
    fd.append('discount', String(value.discount ?? 0));
    fd.append('totalItems', String(value.totalItems));
    fd.append('categoryId', String(value.categoryId));
    if (value.subCategoryId) fd.append('subCategoryId', String(value.subCategoryId));
    if (value.brandId) fd.append('brandId', String(value.brandId));
    if (value.gender) fd.append('gender', String(value.gender));
    if (value.tags) fd.append('tags', String(value.tags));

    const attributes = (value.attributes ?? [])
      .filter((item: any) => item?.key?.trim() && item?.value?.trim())
      .map((item: any) => ({ key: item.key.trim(), value: item.value.trim() }));
    if (attributes.length) fd.append('attributes', JSON.stringify(attributes));

    this.images.forEach(file => fd.append('images', file, file.name));

    const request$ = this.isEditMode && this.productId
      ? this.productsSvc.editProduct(this.productId, fd)
      : this.productsSvc.addProduct(fd);

    this.subs.add(
      request$.subscribe({
        next: () => {
          this.router.navigate(['/store', this.storeId, 'admin', 'products']);
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err?.error?.message ?? 'Failed to save product.';
          this.cdr.markForCheck();
        },
        complete: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      }),
    );
  }

  cancel(): void {
    this.router.navigate(['/store', this.storeId, 'admin', 'products']);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    [...this.newImagePreviews, ...this.existingImagePreviews]
      .filter(url => url.startsWith('blob:'))
      .forEach(url => URL.revokeObjectURL(url));
  }
}
