import { CategoryService } from './../../services/category.service';
import { Component, Input } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent {
  loading=false
  openEdit = true;
  allCategories: any;
  categoryName: any;
  categoryImg: any;
  file: any;
  newCategoryName: any;
  categoryId: any;
  @Input() allData: any;

  constructor(
    private CategoryService: CategoryService,
    private SharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.SharedService.currentAllCategories.subscribe((data:any)=>{
      this.allCategories =data
          })
  }

  upload(event: any) {
    const file = event.target.files[0];
    this.categoryImg = file;
  }
  addCategory() {
    this.loading=!this.loading
    const formdata = new FormData();
    formdata.append('image', this.categoryImg);
    formdata.append('name', this.categoryName);
    this.CategoryService.addCategory(formdata).subscribe((data: any) => {
      if (data.message == 'created') {
        this.loading=!this.loading
        this.SharedService.updateCategories()
        this.categoryName = '';
      }
    });
  }
  removeCategory(id: any) {
    this.loading=!this.loading
    this.CategoryService.removeCategory(id).subscribe((data: any) => {
      if (data.message == 'Deleted') {
        this.loading=!this.loading
        this.SharedService.updateCategories()
      }
    });
  }
  editCategory() {
    this.loading=!this.loading
    const formdata = new FormData();
    formdata.append('image', this.categoryImg);
    formdata.append('name', this.newCategoryName);
    this.CategoryService.updateCategory(formdata, this.categoryId).subscribe(
      (data: any) => {
        if (data.message == 'Category is updated') {
          this.loading=!this.loading
          this.SharedService.updateCategories()
          this.openEdit = !this.openEdit;
          this.newCategoryName = '';
          this.categoryImg = '';
        }
      }
    );
  }
}
