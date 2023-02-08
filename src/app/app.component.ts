import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { ChatService } from './services/chat.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { HttpErrorResponse } from '@angular/common/http';

Router
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  cartlength: any;
  userdata: any;
  constructor(
    private UserService: UserService,
    private ChatService: ChatService,
    private router: Router,
    private SharedService: SharedService

  ) {
  }

  ngOnInit(): void {
  //   if (localStorage.getItem('userToken')) {
  //     this.SharedService.updateAllData()

  //   }


  //   if (localStorage.getItem('userToken')) {
  //     this.getdata();
  //   }
  // }

  // getdata() {
  //   const token = localStorage.getItem('userToken');
  //   this.UserService.getUserData(token).subscribe((data: any) => {
  //     this.cartlength = data.userData?.cart.length;
  //     this.userdata = data.userData;
  //     // this.updateSocketId();
  //   });
  // }
  // updateSocketId() {
  //   this.ChatService.emit('updateSocketId', this.userdata?._id);
  }
}
