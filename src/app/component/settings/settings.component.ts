import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Component, Input, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
  @Input() settings: any;
  @Input() userData: any;
  newEmail: any;
  oldPassword: any;
  newPassword: any;
  confirmNewPassword: any;
  passwordErr:any
  confirmPassErr:any
  emailErr:any
  constructor(private UserService: UserService,private router:Router,private _SharedService:SharedService) {}
ngOnInit(): void {
}

  updateEmail() {
    let data = {
      email: this.newEmail,
      type: 'email',
    };
    this.UserService.updateUser(data, this.userData._id).subscribe(
      (data: any) => {
        if (data.message == 'email is updated') {
          localStorage.clear();
          this.router.navigate(['/login'])
        }
      }
    );
  }
  updatePassword() {
    let data = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword,
      type: 'password',
    };
    if (this.confirmNewPassword == this.newPassword) {
      this.UserService.updateUser(data, this.userData._id).subscribe(
        (data:any) => {
          if (data.message == 'password is updated') {
            this.confirmPassErr = ''
            this.passwordErr = ''
              localStorage.clear();
              this.router.navigate(['/login'])

          }
        },(err: HttpErrorResponse) => {
          this.confirmPassErr = ''
          this.passwordErr = ''
          this.passwordErr = err.error.message

        }
      );
    }else{
      this.confirmPassErr = 'confirm password must be same of password'
    }

  }
  logOut()
  {
    localStorage.removeItem('userToken');
    this._SharedService.updateUserData()
    this.router.navigate([`/login`]);
  }
}
