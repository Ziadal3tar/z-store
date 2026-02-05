import { Subscription } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css'],
})
export class PersonalComponent implements OnInit {
  @Input() personal: any;


  @Input() userData: any;

  constructor(private UserService: UserService) {}

  ngOnInit(): void {
  }


}
