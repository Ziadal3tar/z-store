import { SharedService } from './../../../services/shared.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-filter-btn',
  templateUrl: './filter-btn.component.html',
  styleUrls: ['./filter-btn.component.css'],
})
export class FilterBtnComponent {
  @Output() productsChanged: EventEmitter<any> = new EventEmitter<any>();
  @Input() products: any;

  prices: any[] = [
    { from: 0, to: 50 },
    { from: 50, to: 100 },
    { from: 100, to: 200 },
    { from: 200, to: 500 },
    { from: 500, to: 1000 },
    { from: 1000, to: 999999999999999 },
  ];
  colors: any[] = [
    "black",
    "red",
    "blue",
    "green",
    "yellow",
    "white",
    "orange",
    "brown",
    "gray",
  ];


  constructor(private SharedService: SharedService) {
    this.productsChanged = new EventEmitter<string>();
  }

  priceFilter(price: any) {
    if (price == 'all') {
      this.SharedService.currentAllProduct.subscribe((data: any) => {
        this.products = data;
        this.productsChanged.next(this.products);
      });
    }else{
    this.SharedService.currentAllProduct.subscribe((data: any) => {
      this.products = data.filter(
        (item: any) =>
          item.finalPrice >= price.from && item.finalPrice <= price.to
      );
      this.productsChanged.next(this.products);
    });
  }}

  colorFilter(color: any) {
    if (color == 'all') {
      this.SharedService.currentAllProduct.subscribe((data: any) => {
        this.products = data;
        this.productsChanged.next(this.products);
      });
    }else{
    this.SharedService.currentAllProduct.subscribe((data: any) => {
      this.products = data.filter(
        (item: any) =>
          item.colors.includes(color) == true
      );

      this.productsChanged.next(this.products);
    });
  }}

}
