import {
ChangeDetectionStrategy,
ChangeDetectorRef,
Component,
Input,
OnDestroy,
OnInit,
} from '@angular/core';
import { Subject, combineLatest, takeUntil } from 'rxjs';

import { CatalogStateService } from 'src/app/core/state/catalog-state.service';
import { SubCategoriesService } from './../../core/services/sub-categories.service';

interface Category {
_id?: string;
name?: string;
}

interface SubCategory {
_id?: string;
name?: string;
image?: string;
categoryId?: Category;
createdBy?: {
userName?: string;
};
}

@Component({
selector: 'app-subcategory-management',
templateUrl: './subcategory-management.component.html',
styleUrls: ['./subcategory-management.component.css'],
changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubcategoryManagementComponent
implements OnInit, OnDestroy
{
@Input() allData: any;

SubCategoryImg: File | null = null;

openEdit = false;

allCategories: Category[] = [];
allSubCategories: SubCategory[] = [];
itemsPerPage = 8;
currentPage = 1;

categoryId = '';
subCategoryName = '';

newSubCategoryName = '';
subCategoryId: string | null = null;

editingSubCategory?: SubCategory;

loading = false;
errMessage = '';

readonly placeholderImg =
'https://via.placeholder.com/150?text=No+Image';

private readonly destroy$ =
new Subject<void>();

constructor(
private readonly subCategoriesService: SubCategoriesService,
private readonly catalogStateService: CatalogStateService,
private readonly cdr: ChangeDetectorRef
) {}

ngOnInit(): void {
combineLatest([
this.catalogStateService.categories$,
this.catalogStateService.subCategories$,
])
.pipe(takeUntil(this.destroy$))
.subscribe(
([categories, subCategories]: [
Category[],
SubCategory[]
]) => {
this.allCategories =
Array.isArray(categories)
? categories
: [];


      this.allSubCategories =
        Array.isArray(subCategories)
          ? subCategories
          : [];

      this.cdr.markForCheck();
    }
  );

  this.catalogStateService.refreshCategories();
  this.catalogStateService.refreshSubCategories();
}

ngOnDestroy(): void {
this.destroy$.next();
this.destroy$.complete();
}

get selectedCategory(): Category | undefined {
return this.allCategories.find(
(category) =>
category?._id === this.categoryId
);
}

get filteredSubCategories(): SubCategory[] {
if (!this.categoryId) {
return [];
}


return this.allSubCategories.filter(
  (item) =>
    item?.categoryId?._id ===
    this.categoryId
);


}

selectCategory(value?: string): void {
this.errMessage = '';


this.categoryId =
  value ??
  this.categoryId ??
  '';

this.currentPage = 1;

if (!this.categoryId) {
  this.subCategoryName = '';
}

this.cdr.markForCheck();


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

this.SubCategoryImg = file;

this.cdr.markForCheck();


}

addSubCategory(): void {
if (this.loading) {
return;
}


const name =
  this.subCategoryName.trim();

if (!this.categoryId) {
  this.errMessage = 'Select category';
  this.cdr.markForCheck();
  return;
}

if (!name) {
  this.errMessage =
    'Enter subcategory name';
  this.cdr.markForCheck();
  return;
}

this.errMessage = '';
this.loading = true;
this.cdr.markForCheck();

const formData = new FormData();

if (this.SubCategoryImg) {
  formData.append(
    'image',
    this.SubCategoryImg
  );
}

formData.append('name', name);

this.subCategoriesService
  .addSubCategory(
    formData,
    this.categoryId
  )
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data: any) => {
      if (data?.message === 'created') {
        const created = data?.result;
        if (created?._id) {
          this.catalogStateService.upsertSubCategory(created);
        } else {
          this.catalogStateService.refreshSubCategories();
        }

        this.subCategoryName = '';
        this.SubCategoryImg = null;
      }

      this.loading = false;
      this.cdr.markForCheck();
    },
    error: (error: any) => {
      console.error(
        'Add subcategory failed:',
        error
      );

      this.loading = false;
      this.errMessage =
        'Unable to create subcategory.';

      this.cdr.markForCheck();
    },
  });


}

removeSubCategory(id?: string): void {
if (!id || this.loading) {
return;
}


const confirmed = window.confirm(
  'Are you sure you want to delete this subcategory?'
);

if (!confirmed) {
  return;
}

this.loading = true;
this.cdr.markForCheck();

this.subCategoriesService
  .removeSubCategory(id)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data: any) => {
      if (data?.message === 'deleted') {
        this.catalogStateService.removeSubCategory(id);
      }

      this.loading = false;
      this.cdr.markForCheck();
    },
    error: (error: any) => {
      console.error(
        'Remove subcategory failed:',
        error
      );

      this.loading = false;
      this.cdr.markForCheck();
    },
  });


}

openEditModal(
item: SubCategory
): void {
if (!item?._id) {
return;
}


this.openEdit = true;
this.subCategoryId = item._id;

this.newSubCategoryName =
  item.name || '';

this.SubCategoryImg = null;
this.editingSubCategory = item;

this.cdr.markForCheck();


}

closeEditModal(): void {
this.openEdit = false;


this.subCategoryId = null;
this.newSubCategoryName = '';
this.SubCategoryImg = null;
this.editingSubCategory =
  undefined;

this.cdr.markForCheck();


}

editSubCategory(): void {
if (
!this.subCategoryId ||
!this.newSubCategoryName.trim() ||
this.loading
) {
return;
}


this.loading = true;
this.cdr.markForCheck();

const formData = new FormData();

if (this.SubCategoryImg) {
  formData.append(
    'image',
    this.SubCategoryImg
  );
}

formData.append(
  'name',
  this.newSubCategoryName.trim()
);

this.subCategoriesService
  .updateSubCategory(
    formData,
    this.subCategoryId
  )
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data: any) => {
      if (
        data?.message ===
        'SubCategory is updated'
      ) {
        const updated = data?.updatedSubCategory;
        if (updated?._id) {
          this.catalogStateService.upsertSubCategory(updated);
        } else {
          this.catalogStateService.refreshSubCategories();
        }

        this.closeEditModal();
      }

      this.loading = false;
      this.cdr.markForCheck();
    },
    error: (error: any) => {
      console.error(
        'Update subcategory failed:',
        error
      );

      this.loading = false;
      this.cdr.markForCheck();
    },
  });


}

trackByCategory(
index: number,
category: Category
): string | number {
return category?._id ?? index;
}

get totalPages(): number {
return Math.max(1, Math.ceil(this.filteredSubCategories.length / this.itemsPerPage));
}

get paginatedSubCategories(): SubCategory[] {
const start = (this.currentPage - 1) * this.itemsPerPage;
return this.filteredSubCategories.slice(start, start + this.itemsPerPage);
}

get pageNumbers(): number[] {
return Array.from({ length: this.totalPages }, (_, index) => index + 1);
}

goToPage(page: number): void {
this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
this.cdr.markForCheck();
}

trackBySubCategory(
index: number,
subCategory: SubCategory
): string | number {
return subCategory?._id ?? index;
}
}
