import { SharedService } from 'src/app/services/shared.service';
import { Component, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admins-control',
  templateUrl: './admins-control.component.html',
  styleUrls: ['./admins-control.component.css'],
})
export class AdminsControlComponent {
  @Input() allData: any;
  name: any;
  allUser: any[] = [];
  messageErr: any;
  loaded = 'd-none';
  loading = 'd-none';
  allAdmins:any[] = []
userData:any
confirmRemoveUser=false
deletedUserId:any
  constructor(
    private UserService: UserService,
    private SharedService: SharedService
  ) {}
  ngOnInit(): void {
    this.SharedService.currentUserData.subscribe((data:any)=>{
      this.userData=data
    })
    this.SharedService.currentAllAdmins.subscribe(((data:any)=>{
      this.allAdmins = data
    }))
  }


  search() {

    this.loaded = '';
    this.messageErr = '';
    let data = {
      name: this.name,
    };

    if (data.name == '') {
      this.allUser = [];
      this.messageErr = '';
      this.loaded = 'd-none';
    } else {
      this.UserService.searchUser(data).subscribe((data: any) => {
        this.allUser = data.allUser;
        if (data.message == 'users') {
          this.loaded = 'd-none';
          this.loading = 'd-none'
        } else {
          this.loaded = 'd-none';
          this.loading = 'd-none'
          if (this.name == '') {
            this.messageErr = '';
          } else {
            this.messageErr = data.message;
          }
        }
      });
    }
  }

  addAdmin(id: any) {
    this.loading = ''
    this.UserService.addAdmin(id).subscribe((data: any) => {
      if (data.message == 'added') {
         this.SharedService.updateAdmins();
        this.loading = 'd-none'
      }
    });
  }
  block(id: any) {
    this.loading = ''
    this.UserService.block(id).subscribe((data: any) => {
      if (data.message == 'Done') {
        this.search();
      }
    });
  }
  removeUser(id:any){
this.UserService.deleteUser(id).subscribe((data:any)=>{

})
  }
  removeAdmin(id: any) {
    this.loading = ''
    this.UserService.addAdmin(id).subscribe((data: any) => {
      if (data.message == 'removed') {
        this.loading = 'd-none'
        this.SharedService.updateAdmins();
      }
    });
  }
}
