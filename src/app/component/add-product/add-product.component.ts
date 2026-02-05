import { Subscriber, Observable } from 'rxjs';
import { BrandsService } from 'src/app/services/brands.service';
import { SubCategoriesService } from './../../services/sub-categories.service';
import { CategoryService } from './../../services/category.service';
import { UserService } from './../../services/user.service';
import { Component, Input, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedService } from 'src/app/services/shared.service';
@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit {
  productadded: any;
  productImg: any;
  mainimg: any;
  name: any;
  description: any;
  price: any;
  sale: any;
  category: any;
  forWhom: any;
  files: any;
  quantity: any;
  hide = 'd-none';
  added = 'added1';
  categoryId: any;
  subCategoryId: any;
  brandId: any;
  gender: any;
  allCategories: any;
  allSubCategories: any;
  allBrands: any;
  @Input() allData: any;
  loading=false
  add=false
  constructor(
    private ProductsService: ProductsService,
    private SharedService: SharedService
  ) {}
  ngOnInit() {

    this.SharedService.currentAllCategories.subscribe((data: any) => {
      this.allCategories = data;
      this.SharedService.currentAllSubCategories.subscribe((data: any) => {
        this.allSubCategories = data;
        this.SharedService.currentAllBrands.subscribe((data: any) => {
          this.allBrands = data;
        });
      });
    });
  }
  select() {
    this.categoryId = (<HTMLInputElement>(
      document.getElementById('categoryId_AP')
    )).value;
    this.subCategoryId = (<HTMLInputElement>(
      document.getElementById('subCategoryId_AP')
    )).value;
    this.brandId = (<HTMLInputElement>(
      document.getElementById('brandId_AP')
    )).value;
    this.gender = (<HTMLInputElement>document.getElementById('gender')).value;
  }
  uploads(event: any) {
    this.hide = '';
    const { files } = event.target;
    this.files = files;
    const imgs: any[] = [];
    for (let i = 0; i < this.files.length; i++) {

      const element = this.files[i];
      const reader = new FileReader();
      reader.readAsDataURL(element);
      reader.onload = (event: any) => {
        console.log(event.target.result);
        if (i==0) {
          this.mainimg = event.target.result;
        }
        imgs.push(event.target.result);
      };
    }
    this.productImg = imgs;
  }
 addProduct(): void {
  if (!this.categoryId) {
    alert('Please select a category first');
    return;
  }

  this.loading = true;
  const formdata = new FormData();

  for (let i = 0; i < this.files?.length; i++) {
    const element: any = this.files[i];
    formdata.append('image', element);
  }

  formdata.append('name', this.name || '');
  formdata.append('description', this.description || '');
  formdata.append('price', this.price || '');
  formdata.append('discount', this.sale || '');
  formdata.append('totalItems', this.quantity || '');
  formdata.append('gender', this.gender || '');

  // append optional fields only if available
  if (this.subCategoryId) {
    formdata.append('subCategoryId', this.subCategoryId);
  }
  if (this.brandId) {
    formdata.append('brandId', this.brandId);
  }

  this.ProductsService.addproduct(formdata, this.categoryId).subscribe({
    next: (data: any) => {
      console.log(data);
      if (data.message === 'Created') {
        this.added = 'added';
        setTimeout(() => {
          this.added = 'added1  opacity-0';
        }, 1000);
        this.add = true;
      }
      this.loading = false;
    },
    error: (err: any) => {
      console.error(err);
      this.loading = false;
    }
  });
}

}
