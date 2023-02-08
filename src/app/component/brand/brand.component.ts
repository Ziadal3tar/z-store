import { SharedService } from 'src/app/services/shared.service';
import { Component, Input } from '@angular/core';
import { SubCategoriesService } from './../../services/sub-categories.service';
import { CategoryService } from './../../services/category.service';
import { BrandsService } from 'src/app/services/brands.service';
@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.css'],
})
export class BrandComponent {
  brandImg: any;
  openEdit = true;
  allCategories: any;
  allSubCategories: any;
  allBrands: any;
  categoryId: any;
  brandName: any;
  newBrandName: any;
  brandId: any;
  @Input() allData: any;
  loading=false
  constructor(
    private CategoryService: CategoryService,
    private SubCategoriesService: SubCategoriesService,
    private BrandsService: BrandsService,
    private SharedService: SharedService
  ) {}
  ngOnInit(): void {
    this.SharedService.currentAllBrands.subscribe((data:any)=>{
      this.allBrands = data
    })
  }

  upload(event: any) {
    const file = event.target.files[0];
    this.brandImg = file;
  }
  addBrand() {
    this.loading=!this.loading

    const formdata = new FormData();
    formdata.append('image', this.brandImg);
    formdata.append('name', this.brandName);
    this.BrandsService.addBrand(formdata).subscribe((data: any) => {
      if (data.message == 'created') {
        this.brandName = undefined;
        this.brandImg = undefined;
        this.SharedService.updateBrands();
        this.loading=!this.loading

      }
    });
  }

  removebrand(id: any) {
    this.loading=!this.loading

    this.BrandsService.removeBrand(id).subscribe((data: any) => {
      if (data.message == 'Deleted') {
        this.SharedService.updateBrands();
        this.loading=!this.loading

      }
    });
  }

  editBrand() {
    this.loading=!this.loading

    const formdata = new FormData();

    formdata.append('image', this.brandImg);
    formdata.append('name', this.newBrandName);
    this.BrandsService.updateBrand(formdata, this.brandId).subscribe(
      (data: any) => {

        if (data.message == 'brand is updated') {
          this.SharedService.updateBrands();
          this.openEdit = !this.openEdit;
          this.newBrandName = undefined;
          this.brandImg = undefined;
          this.loading=!this.loading

        }
      }
    );
  }
}
