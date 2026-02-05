import { SharedService } from 'src/app/services/shared.service';
import { StoresService } from './../../services/stores.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-your-store',
  templateUrl: './your-store.component.html',
  styleUrls: ['./your-store.component.css'],
})
export class YourStoreComponent implements OnInit {
  storeId: any;
  userData: any;
image:any
storeImg:any
loading=false
storeData:any

  color:any
  constructor(
    private UserService: UserService,
    private Router: Router,
    private _activatedRoute: ActivatedRoute,
    private StoresService: StoresService,
    private SharedService:SharedService

  ) {
    this.storeId = _activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.SharedService.updateUserData()
    this.SharedService.updateStoreData(this.storeId)
    this.SharedService.currentStoreData.subscribe((data:any)=>{
      this.storeData = data
      this.storeImg = this.storeData?.storeImage
    })
    this.SharedService.currentUserData.subscribe((data:any)=>{
      this.SharedService.emit('updateStoreSocketId', data.storeId?._id);
      this.userData = data
    })
  }

  upload(event: any) {
    const file = event.target.files[0];
    this.image = file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      this.storeImg = event.target.result;;
    };
  }

  save() {
    this.loading = true
    const formdata = new FormData();
    formdata.append('image', this.image);
    formdata.append('id', this.userData?.storeId?._id);
    this.StoresService.editStoreImg(formdata).subscribe((data: any) => {
      if (data.message == 'Done') {
this.image=''
this.loading = false

      }
    });
  }


}
