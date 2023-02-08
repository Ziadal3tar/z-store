import { SharedService } from 'src/app/services/shared.service';
import { SubCategoriesService } from './../../services/sub-categories.service';
import { CategoryService } from './../../services/category.service';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sup-category',
  templateUrl: './sup-category.component.html',
  styleUrls: ['./sup-category.component.css'],
})
export class SupCategoryComponent {
  SubCategoryImg: any;
  openEdit = true;
  allCategories: any;
  allSubCategories: any;
  categoryId: any;
  subCategoryName: any;
  newSubCategoryName: any;
  subCategoryId: any;
  @Input() allData: any;
  loading=false
  errMessage:any

  constructor(
    private CategoryService: CategoryService,
    private SubCategoriesService: SubCategoriesService,
    private SharedService: SharedService
  ) {}
  ngOnInit(): void {
    this.SharedService.currentAllCategories.subscribe((data:any)=>{
      this.allCategories = data
      this.SharedService.currentAllSubCategories.subscribe((data:any)=>{
        this.allSubCategories = data
      })
    })
  }

  upload(event: any) {
    const file = event.target.files[0];
    this.SubCategoryImg = file;
  }
  addSubCategory() {
    if (this.categoryId) {
      this.loading=!this.loading
      const formdata = new FormData();
      formdata.append('image', this.SubCategoryImg);
      formdata.append('name', this.subCategoryName);
      this.SubCategoriesService.addSubCategory(
        formdata,
        this.categoryId
      ).subscribe((data: any) => {
        if (data.message == 'created') {
          this.subCategoryName = undefined;
          this.SubCategoryImg = undefined;
          this.SharedService.updateSubCategories();
          this.loading=!this.loading
        }
      });
    }else{
      this.errMessage = 'select category'
    }

  }
  selectCategory() {
    this.errMessage=''
    var inputValue = (<HTMLInputElement>document.getElementById('categoryId'))
      .value;
    this.categoryId = inputValue;
  }
  removeSubCategory(id: any) {
    this.loading=!this.loading
    this.SubCategoriesService.removeSubCategory(id).subscribe((data: any) => {
      if (data.message == 'deleted') {
        this.SharedService.updateSubCategories();
        this.loading=!this.loading
      }
    });
  }

  editSubCategory() {
    this.loading=!this.loading
    const formdata = new FormData();
    formdata.append('image', this.SubCategoryImg);
    formdata.append('name', this.newSubCategoryName);
    this.SubCategoriesService.updateSubCategory(
      formdata,
      this.subCategoryId
    ).subscribe((data: any) => {
      if (data.message == 'SubCategory is updated') {
        this.SharedService.updateSubCategories();
        this.openEdit = !this.openEdit;
        this.newSubCategoryName = undefined;
        this.SubCategoryImg = undefined;
        this.loading=!this.loading

      }
    });
  }
}
