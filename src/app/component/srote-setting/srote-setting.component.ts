import { UserService } from './../../services/user.service';
import { StoresService } from './../../services/stores.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-srote-setting',
  templateUrl: './srote-setting.component.html',
  styleUrls: ['./srote-setting.component.css'],
})
export class SroteSettingComponent implements OnInit {
  userdata: any;
  storeId: any;
  storedata: any;
  num = 0;
  thenum: any;
  categoryName = '';
  categoriesArr: any[] = [];
  cc1 = '';
  cc0 = '';
  disabled = '';
  i: any;
  icon = 'fa-solid fa-check text-success';
  hint: any;
  hint2 = 'opacity-0';
  message = '';
  message2 = 'opacity-0';
  num2: any;
  style1 = 'opacity-0';
  ifMore0 = '';
  btnstyle = '';
  colors="black"
  colorsStyle=false
  updatedImg:any
  url:any
  title:any
  color:any
  storeName:any
  btnSaveStyle="btnSaveStyle"
  @Output() Setting: EventEmitter<any> = new EventEmitter<any>();
  @Output() Products: EventEmitter<any> = new EventEmitter<any>();


  constructor(
    private StoresService: StoresService,
    private UserService: UserService
  ) {}

  ngOnInit(): void {
  }
  choseColor(d:any){
this.color = d
this.cc()

  }
 
  storeData() {
    this.StoresService.getStore(this.storeId).subscribe((data: any) => {
      this.storedata = data.store;
      this.color = data.store?.color
      this.title = data.store?.title
      this.storeName = data.store?.name
      this.url = data.store?.profilePic


      if (this.storedata?.storeCategories.length != 0) {
        this.disabled = 'disabled';
        this.ifMore0 = 'style';
        this.btnstyle = 'btnstyle';
      }
    });
  }
  addnum() {
    if (this.num == 0) {
      this.style1 = 'opacity-100';
      return;
    } else {
      if (this.disabled == 'disabled') {
        this.disabled = '';
        this.thenum = 0;
        this.num = 0;
        this.icon = 'fa-solid fa-check text-success';
        this.message = '';

        this.categoriesArr.splice(0, this.categoriesArr.length);
      } else {
        this.disabled = 'disabled';
        this.thenum = this.num;
        this.icon = 'fa-solid fa-rotate-left text-danger';
      }
    }
  }
  getI(event: any) {
    this.message = '';
    if (event.target.value == '') {
      return;
    } else {
      let i = this.categoriesArr.indexOf(event.target.value);
      this.categoriesArr.splice(i, 1);
    }
  }
  categories(event: any) {
    if (event.target.value == '') {
      return;
    } else {
      const cc = [];
      if (this.categoriesArr.length == 0) {
      } else {
        for (let i = 0; i < this.categoriesArr.length; i++) {
          const element = this.categoriesArr[i];
          cc.push(element);
        }
      }
      const Name = event.target.value;
      cc.push(Name);
      this.categoriesArr = cc;
    }
  }

  validation(event: any) {
    return /[a-z]/i.test(event.key);
  }

  upload(event: any) {
    const file = event.target.files[0];
    this.updatedImg = file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      this.url = event.target.result;
    };
    this.cc()
  }
  editStoreData(){

const formdata = new FormData();
formdata.append('file', this.updatedImg);
formdata.append('title', this.title);
formdata.append('color', this.color);
formdata.append('storeName', this.storeName);
formdata.append('id', this.storedata?._id);




// this.StoresService.editStoreData(formdata).subscribe((data:any)=>{
  // if(data.message == "updated"){
  //   this.userData()
  // }

// })


  }

  cc(){
    if (
      this.color != this.storedata.color ||
      this.title != this.storedata.title ||
      this.storeName != this.storedata.name ||
      this.url != this.storedata.profilePic
    ) {
      this.btnSaveStyle = '';

    } else {
      this.btnSaveStyle = 'btnSaveStyle';

    }
  }
}
