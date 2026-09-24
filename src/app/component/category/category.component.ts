import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { CategoryService } from './../../services/category.service';
import { CatalogStateService } from 'src/app/core/state/catalog-state.service';

interface Category {
  _id?: string;
  name?: string;
  image?: string;
  createdBy?: {
    userName?: string;
  };
}

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent
  implements OnInit, OnDestroy
{
  @Input() allData: any;
Math = Math;
  loading = false;
  openEdit = false;

  allCategories: Category[] = [];

  categoryName = '';
  categoryImg: File | null = null;

  newCategoryName = '';
  categoryId: string | null = null;

  editPreviewName = '';
  selectedCategoryImage = '';

  readonly placeholderImg =
    'https://via.placeholder.com/150?text=No+Image';

  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;

  private readonly destroy$ =
    new Subject<void>();


  constructor(
    private readonly categoryService: CategoryService,
    private readonly catalogState: CatalogStateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.catalogState.categories$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Category[]) => {
        console.log(data);

        this.allCategories = Array.isArray(data)
          ? data
          : [];

        this.resetPagination();
        this.cdr.markForCheck();
      });

    this.catalogState.refreshCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  upload(
    event: Event,
    mode: 'add' | 'edit'
  ): void {
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

    this.categoryImg = file;

    if (mode === 'edit') {
      this.editPreviewName = file.name;
    } else {
      this.editPreviewName = '';
    }

    this.cdr.markForCheck();
  }

  addCategory(): void {
    const name =
      this.categoryName.trim();

    if (!name || this.loading) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const formData = new FormData();

    if (this.categoryImg) {
      formData.append(
        'image',
        this.categoryImg
      );
    }

    formData.append('name', name);

    this.categoryService
      .addCategory(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data?.message === 'created') {
            this.catalogState.refreshCategories();

            this.categoryName = '';
            this.categoryImg = null;

            this.cdr.markForCheck();
          }

          this.loading = false;
          this.cdr.markForCheck();
        },

        error: (error: any) => {
          console.error(
            'Add category failed:',
            error
          );

          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  removeCategory(
    id?: string
  ): void {
    if (!id || this.loading) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this category?'
    );

    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.categoryService
      .removeCategory(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data?.message === 'Deleted') {
            this.catalogState.refreshCategories();
          }

          this.loading = false;
          this.cdr.markForCheck();
        },

        error: (error: any) => {
          console.error(
            'Remove category failed:',
            error
          );

          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  openEditModal(
    item: Category
  ): void {
    if (!item?._id) {
      return;
    }

    this.openEdit = true;

    this.categoryId = item._id;
    this.newCategoryName =
      item.name || '';

    this.selectedCategoryImage =
      item.image || '';

    this.categoryImg = null;
    this.editPreviewName = '';

    this.cdr.markForCheck();
  }

  closeEditModal(): void {
    this.openEdit = false;
    this.categoryId = null;

    this.newCategoryName = '';
    this.categoryImg = null;
    this.editPreviewName = '';
    this.selectedCategoryImage = '';

    this.cdr.markForCheck();
  }

  editCategory(): void {
    if (
      !this.categoryId ||
      !this.newCategoryName.trim() ||
      this.loading
    ) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const formData = new FormData();

    if (this.categoryImg) {
      formData.append(
        'image',
        this.categoryImg
      );
    }

    formData.append(
      'name',
      this.newCategoryName.trim()
    );

    this.categoryService
      .updateCategory(
        formData,
        this.categoryId
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (
            data?.message ===
            'Category is updated'
          ) {
            this.catalogState.refreshCategories();
            this.closeEditModal();
          }

          this.loading = false;
          this.cdr.markForCheck();
        },

        error: (error: any) => {
          console.error(
            'Update category failed:',
            error
          );

          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  resetPagination(): void {
    this.currentPage = 1;

    this.totalPages = Math.max(
      1,
      Math.ceil(
        this.allCategories.length /
          this.itemsPerPage
      )
    );
  }

  get pagedCategories(): Category[] {
    const start =
      (this.currentPage - 1) *
      this.itemsPerPage;

    const end =
      start + this.itemsPerPage;

    return this.allCategories.slice(
      start,
      end
    );
  }

  get currentPageStart(): number {
    return (
      (this.currentPage - 1) *
      this.itemsPerPage
    );
  }

  goToPage(page: number): void {
    if (!this.totalPages) {
      return;
    }

    this.currentPage = Math.min(
      Math.max(page, 1),
      this.totalPages
    );

    this.cdr.markForCheck();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.markForCheck();
    }
  }

  nextPage(): void {
    if (
      this.currentPage <
      this.totalPages
    ) {
      this.currentPage++;
      this.cdr.markForCheck();
    }
  }

  pagesToShow(): number[] {
    const maxShow = 7;

    if (this.totalPages <= maxShow) {
      return Array.from(
        {
          length: this.totalPages,
        },
        (_, index) => index + 1
      );
    }

    let start = Math.max(
      1,
      this.currentPage -
        Math.floor(maxShow / 2)
    );

    let end =
      start + maxShow - 1;

    if (end > this.totalPages) {
      end = this.totalPages;

      start =
        end - maxShow + 1;
    }

    return Array.from(
      {
        length: end - start + 1,
      },
      (_, index) => start + index
    );
  }

  trackByCategory(
    index: number,
    item: Category
  ): string | number {
    return item?._id ?? index;
  }
}
