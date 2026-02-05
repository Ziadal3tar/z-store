import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { UserService } from './../../services/user.service';
import {
  Component, OnInit, Input, Output, EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-res-nav',
  templateUrl: './res-nav.component.html',
  styleUrls: ['./res-nav.component.css'],
})
export class ResNavComponent implements OnInit {

userdata:any

@Input() sideNav = 'close';
@Output() backNav: EventEmitter<any> = new EventEmitter<any>();
constructor(private UserService:UserService,private router:Router,private SharedService:SharedService) {}

ngOnInit(): void {
this.SharedService.currentUserData.subscribe((data:any)=>{
  this.userdata = data
})
}
back() {
  this.sideNav = 'close';
  this.backNav.emit(this.sideNav);
}
logout(){
  localStorage.removeItem("userToken")
  this.router.navigate([`/login`]);
}
}
