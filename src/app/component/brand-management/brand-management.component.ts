import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { BrandsService } from 'src/app/core/services/brands.service';
import { CatalogStateService } from 'src/app/core/state/catalog-state.service';

interface Brand {
  _id?: string;
  name?: string;
  image?: string;
  createdBy?: {
    userName?: string;
  };
}

@Component({
  selector: 'app-brand-management',
  templateUrl: './brand-management.component.html',
  styleUrls: ['./brand-management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandManagementComponent
  implements OnInit, OnDestroy
{
  @Input() allData: any;

  brandImg: File | null = null;

  openEdit = false;

  allBrands: Brand[] = [];
  readonly itemsPerPage = 8;
  currentPage = 1;

  brandName = '';
  newBrandName = '';
  brandId: string | null = null;

  editingBrand?: Brand;

  loading = false;

  readonly placeholderImg =
    'https://via.placeholder.com/150?text=No+Image';

  private readonly destroy$ =
    new Subject<void>();

  constructor(
    private readonly brandsService: BrandsService,
    private readonly catalogState: CatalogStateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.catalogState.brands$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Brand[]) => {
        this.allBrands = Array.isArray(data)
          ? data
          : [];

        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.cdr.markForCheck();
      });

    this.catalogState.refreshBrands();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  upload(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      input.value = '';
      return;
    }

    this.brandImg = file;

    this.cdr.markForCheck();
  }

  addBrand(): void {
    const name = this.brandName.trim();

    if (!name || this.loading) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const formData = new FormData();

    if (this.brandImg) {
      formData.append(
        'image',
        this.brandImg
      );
    }

    formData.append('name', name);

    this.brandsService
      .addBrand(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data?.message === 'created') {
            const created = data?.result;
            if (created?._id) {
              this.catalogState.upsertBrand(created);
            } else {
              this.catalogState.refreshBrands();
            }

            this.currentPage = 1;
            this.brandName = '';
            this.brandImg = null;
          }

          this.loading = false;
          this.cdr.markForCheck();
        },

        error: (error: any) => {
          console.error(
            'Add brand failed:',
            error
          );

          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  removeBrand(id?: string): void {
    if (!id || this.loading) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this brand?'
    );

    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.brandsService
      .removeBrand(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data?.message === 'Deleted') {
            this.catalogState.removeBrand(id);
          }

          this.loading = false;
          this.cdr.markForCheck();
        },

        error: (error: any) => {
          console.error(
            'Remove brand failed:',
            error
          );

          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  openEditModal(item: Brand): void {
    if (!item?._id) {
      return;
    }

    this.openEdit = true;

    this.brandId = item._id;
    this.newBrandName =
      item.name || '';

    this.brandImg = null;
    this.editingBrand = item;

    this.cdr.markForCheck();
  }

  closeEditModal(): void {
    this.openEdit = false;

    this.brandId = null;
    this.newBrandName = '';
    this.brandImg = null;
    this.editingBrand = undefined;

    this.cdr.markForCheck();
  }

  editBrand(): void {
    if (
      !this.brandId ||
      !this.newBrandName.trim() ||
      this.loading
    ) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const formData = new FormData();

    if (this.brandImg) {
      formData.append(
        'image',
        this.brandImg
      );
    }

    formData.append(
      'name',
      this.newBrandName.trim()
    );

    this.brandsService
      .updateBrand(
        formData,
        this.brandId
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (
            data?.message ===
            'brand is updated'
          ) {
            const updated = data?.results;
            if (updated?._id) {
              this.catalogState.upsertBrand(updated);
            } else {
              this.catalogState.refreshBrands();
            }
            this.closeEditModal();
          }

          this.loading = false;
          this.cdr.markForCheck();
        },

        error: (error: any) => {
          console.error(
            'Update brand failed:',
            error
          );

          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.allBrands.length / this.itemsPerPage));
  }

  get paginatedBrands(): Brand[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.allBrands.slice(start, start + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
    this.cdr.markForCheck();
  }

  trackByBrand(
    index: number,
    item: Brand
  ): string | number {
    return item?._id ?? index;
  }








  
}
