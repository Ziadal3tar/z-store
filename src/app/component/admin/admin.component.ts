import { SharedService } from 'src/app/services/shared.service';
import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  constructor(
    private SharedService:SharedService
  ) {}
  ngOnInit(): void {}
}
