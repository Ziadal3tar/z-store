import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  hello: any;
  login = 'd-none';
  email: any;
  password: any;
  loading:Boolean=false
  errs = {
    emailErr: '',
    passwordErr: '',
    message: '',
  };

  constructor(private UserService: UserService, private router: Router,private SharedService:SharedService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.hello = 'opacity-0 transition';
      setTimeout(() => {
        this.hello = 'd-none';
        setTimeout(() => {
          this.login = ' opacity-0';
          setTimeout(() => {
            this.login = 'transition opacity-100';
          }, 100);
        }, 10);
      }, 500);
    }, 2000);
   alert(
  'Login Info\n' +
  'Email: admin@gmail.com\n' +
  'Password: admin'
);

  }

  logIn() {
this.loading = !this.loading
    const data = {
      email: this.email,
      password: this.password,
    };

    this.UserService.login(data).subscribe(
      (data: any) => {

        this.errs.emailErr = '';
        this.errs.passwordErr = '';
        if (data) {
          if (data.message == 'welcome') {
            this.loading = !this.loading

            localStorage.setItem('userToken', data.token);
            this.router.navigate([`/home`]);
          }
        }
      }
      ,
      (err: HttpErrorResponse) => {
        this.loading = !this.loading

        if (err.error.validationArr) {
          let arr = err.error.validationArr[0];

          for (let i = 0; i < arr.length; i++) {
            const element = arr[i];
            if (element.message.split(' ')[0].slice(1, -1) == 'email') {
              this.errs.emailErr = element.message;
            } else if (
              element.message.split(' ')[0].slice(1, -1) == 'password'
            ) {
              this.errs.passwordErr = element.message;
            }
          }
        } else {
          this.errs.message = err.error.message;
        }
      }
    );
  }
}
