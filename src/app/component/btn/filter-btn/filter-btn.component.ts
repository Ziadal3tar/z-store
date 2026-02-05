import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-filter-btn',
  templateUrl: './filter-btn.component.html',
  styleUrls: ['./filter-btn.component.css'],
})
export class FilterBtnComponent {
  @Input() products: any[] = [];
  @Output() productsChanged = new EventEmitter<any[]>();

  prices = [
    { from: 0, to: 50 },
    { from: 50, to: 100 },
    { from: 100, to: 200 },
    { from: 200, to: 500 },
    { from: 500, to: 1000 },
    { from: 1000, to: Number.MAX_VALUE },
  ];

  colors = [
    'black',
    'red',
    'blue',
    'green',
    'yellow',
    'white',
    'orange',
    'brown',
    'gray',
  ];

  priceFilter(range: any) {
    if (range === 'all') {
      this.productsChanged.emit([...this.products]);
      return;
    }

    const filtered = this.products.filter(
      p => p.finalPrice >= range.from && p.finalPrice <= range.to
    );

    this.productsChanged.emit(filtered);
  }

  colorFilter(color: string) {
    if (color === 'all') {
      this.productsChanged.emit([...this.products]);
      return;
    }

    const filtered = this.products.filter(p =>
      p.colors?.includes(color)
    );

    this.productsChanged.emit(filtered);
  }
}
