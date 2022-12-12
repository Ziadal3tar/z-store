import { ChatService } from './../../services/chat.service';
import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { UserService } from '../../services/user.service';
import { NgwWowService } from 'ngx-wow';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UserService, NavbarComponent, ChatService],
})
export class LoginComponent implements OnInit {
  hello: any;
  loginArabic = 'd-none';
  loginEnglish = 'd-none';
  dir: any;
  colorValue: any;
  mood = 'morning';
  emailOrPhone: any;
  password: any;
  passErr = '';
  emailErr = '';
  message: any;
  morning = 'url(./assets/img/white-abstract-background_23-2148817571.jpg)';
  night = 'url(./assets/img/6222603.jpg)';
  language = 'العربية';
  constructor(
    private wowService: NgwWowService,
    private elem: ElementRef,
  ) {
    this.wowService.init();
  }

  ngOnInit(): void {
    console.log(localStorage.getItem('token'));
    this.elem.nativeElement.style.setProperty('--bg', this.morning);
    this.elem.nativeElement.style.setProperty('--bgline', 'rgb(0 0 0 / 20%)');


      setTimeout(() => {
        this.hello = 'opacity-0 transition';
        setTimeout(() => {
          this.hello = 'd-none';

          setTimeout(() => {
            this.loginArabic = 'opacity-0 ';
            setTimeout(() => {
              this.loginArabic = 'opacity-100 transition  ';
            }, 100);
          }, 10);
        }, 501);
      }, 2000);
    }
  }

  // changeMood() {
  //   if (this.mood == 'night') {
  //     this.mood = 'morning';
  //     this.elem.nativeElement.style.setProperty('--bg', this.morning);
  //     this.elem.nativeElement.style.setProperty('--bgline', 'rgb(0 0 0 / 20%)');
  //   } else {
  //     this.mood = 'night';
  //     this.elem.nativeElement.style.setProperty('--bg', this.night);
  //     this.elem.nativeElement.style.setProperty(
  //       '--bgline',
  //       'rgb(255, 255, 255)'
  //     );
  //   }
  // }
  // changeLang() {
  //   if (this.loginArabic == 'd-none') {
  //     this.loginArabic = '';
  //     this.language = 'English';
  //     this.dir = 'rtl';
  //     this.loginEnglish = 'd-none';
  //   } else {
  //     this.loginArabic = 'd-none';
  //     this.language = 'العربية';
  //     this.dir = 'ltr';

  //     this.loginEnglish = '';
  //   }
  // }
}
