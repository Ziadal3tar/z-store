import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  token = localStorage.getItem('userToken');

  constructor() { }

  ngOnInit(): void {

  }
  btn(id:any){
    let btn = (<HTMLInputElement>document.getElementById(id));
    btn.innerHTML = `<button data-aos="flip-down" data-aos-duration="1000" class="px-0 text-white btn bg-transparent border-bottom rounded-0">SHOP NOW</button>`
  }

}
