import { StoresService } from './../../services/stores.service';
import { Component, Input, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.css'],
})
export class UserinfoComponent implements OnInit {
  orders = 'd-none';
  favorites = 'd-none';
  personal = 'd-none';
  settings = 'd-none';
  ordersStyle = '';
  favoritesStyle = '';
  personalStyle = '';
  userData: any;
  storDetails = false;
  image: any;
  storeName = '';
  storeCategory = '';
  storeTitle = '';
  removeTitle = '';
  url: any;
  page: any;
  updatedImg: any;
  name = 'mohammed';
  errMessage: any;
  favcount: any;
  ordersCount: any;
  loading=false
  constructor(
    private SharedService: SharedService,
    private _activatedRoute: ActivatedRoute,
    private UserService: UserService,
    private StoresService: StoresService,
    private Router: Router
  ) {}

  ngOnInit(): void {
    this.SharedService.currentUserData.subscribe((data: any) => {
      this.userData = data;

      this.url = data.profilePic;
      this.storeBtnTitle();
    });
  }

  upload(event: any) {
    const file = event.target.files[0];
    this.image = file;
  }
  addStore() {
    this.errMessage = '';
    const formdata = new FormData();
    formdata.append('image', this.image);
    formdata.append('name', this.storeName);

    this.StoresService.addStores(formdata).subscribe((data: any) => {

      if (data.message == 'added') {
        this.storeTitle = 'Open Your Store';
        this.removeTitle = 'delete-store';
        this.Router.navigate([`/yourStore/${data.newStore._id}`]);
      } else if (data.err) {
        this.errMessage = 'You cannot own a store while you are a Admin';
      }
    });
  }

  storeBtnTitle() {
    if (!this.userData.storeId) {
      this.storeTitle = 'Add your store';
      this.removeTitle = '';
    } else {
      this.storeTitle = 'Open Your Store';
      this.removeTitle = 'deleteStore';
    }
  }
  storeBtn() {
    if (!this.userData.storeId) {
      this.storDetails = !this.storDetails;
    } else {
      this.Router.navigate(['/yourStore/' + this.userData.storeId._id]);
      this.storDetails = false;
    }
  }

  deleteStore() {
    const id = this.userData._id;
    if (this.userData.store) {
      this.StoresService.deleteStore(id).subscribe((data: any) => {
        if (data.message == 'removed') {
          this.storeTitle = 'Add your store';
          this.removeTitle = '';
        }
      });
    }
  }

  updateUserImg(event: any) {
    const file = event.target.files[0];
    this.updatedImg = file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      this.url = event.target.result;
    };
  }
  save() {

    this.loading=true
    const formdata = new FormData();
    formdata.append('image', this.updatedImg);
    formdata.append('id', this.userData?._id);
    this.UserService.editProfilePic(formdata).subscribe((data: any) => {
      if (data.message == 'created') {
        this.updatedImg = '';
        this.loading=false

      }
    });
  }
  cancel() {
    this.url = this.userData.profilePic[0];
  }
}
