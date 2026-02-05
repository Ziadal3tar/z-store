import { Component, Input } from '@angular/core';
import { CategoryService } from './../../services/category.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent {
  loading = false;
  openEdit = false;

  allCategories: any[] = [];
  categoryName: string = '';
  categoryImg: File | null = null;
  file: any;
  newCategoryName: string = '';
  categoryId: any;
  editPreviewName: string = '';
  placeholderImg = 'https://via.placeholder.com/150?text=No+Image';

  // pagination
  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;

  @Input() allData: any;

  constructor(
    private CategoryService: CategoryService,
    private SharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.SharedService.currentAllCategories.subscribe((data: any) => {
      this.allCategories = Array.isArray(data) ? data : [];
      console.log(data);

      this.resetPagination();
    });
  }

  /***** upload handler (supports add/edit) *****/
  upload(event: any, mode: 'add' | 'edit') {
    const file = event.target.files?.[0];
    if (!file) return;

    if (mode === 'add') {
      this.categoryImg = file;
    } else {
      this.categoryImg = file;
      this.editPreviewName = file.name;
    }
  }

  /***** Add category *****/
  addCategory() {
    if (!this.categoryName?.trim()) return;
    this.loading = true;
    const formdata = new FormData();
    if (this.categoryImg) formdata.append('image', this.categoryImg);
    formdata.append('name', this.categoryName);

    this.CategoryService.addCategory(formdata).subscribe({
      next: (data: any) => {
        if (data.message === 'created') {
          this.SharedService.updateCategories();
          this.categoryName = '';
          this.categoryImg = null;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /***** Remove category *****/
  removeCategory(id: any) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    this.loading = true;
    this.CategoryService.removeCategory(id).subscribe({
      next: (data: any) => {
        if (data.message === 'Deleted') {
          this.SharedService.updateCategories();
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /***** Open edit modal and set values *****/
  openEditModal(item: any) {
    this.openEdit = true;
    this.categoryId = item._id;
    this.newCategoryName = item.name;
    this.editPreviewName = item.image ? '' : '';
    this.categoryImg = null;
  }

  closeEditModal() {
    this.openEdit = false;
    this.categoryId = null;
    this.newCategoryName = '';
    this.categoryImg = null;
    this.editPreviewName = '';
  }

  /***** Edit category *****/
  editCategory() {
    if (!this.categoryId) return;
    this.loading = true;
    const formdata = new FormData();
    if (this.categoryImg) formdata.append('image', this.categoryImg);
    formdata.append('name', this.newCategoryName || '');

    this.CategoryService.updateCategory(formdata, this.categoryId).subscribe({
      next: (data: any) => {
        if (data.message === 'Category is updated') {
          this.SharedService.updateCategories();
          this.closeEditModal();
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /***** Pagination helpers *****/
  resetPagination() {
    this.currentPage = 1;
    this.totalPages = Math.max(1, Math.ceil((this.allCategories?.length || 0) / this.itemsPerPage));
  }

  pagedCategories() {
    if (!this.allCategories) return [];
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.allCategories.slice(start, end);
  }

  get currentPageStart() {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  goToPage(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  /**
   * Return array of pages to show (smart: shows max 7 with current in center)
   */
  pagesToShow(): number[] {
    const maxShow = 7;
    const pages: number[] = [];
    const total = this.totalPages;
    if (total <= maxShow) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    let start = Math.max(1, this.currentPage - Math.floor(maxShow / 2));
    let end = start + maxShow - 1;
    if (end > total) {
      end = total;
      start = end - maxShow + 1;
    }
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }
}
