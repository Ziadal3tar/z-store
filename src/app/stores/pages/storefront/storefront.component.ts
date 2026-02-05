
import { Component, OnInit } from '@angular/core';

interface Product {
  id: string;
  title: string;
  price: number;
  rating: number;
  category: string;
  image: string;
  badge?: string;
  description?: string;
}

@Component({
  selector: 'app-storefront',
  templateUrl: './storefront.component.html',
  styleUrls: ['./storefront.component.css'],
})
export class StorefrontComponent implements OnInit {
  search = '';
  selectedCategory = 'All';
  sortBy: 'popular' | 'new' | 'price-asc' | 'price-desc' = 'popular';
  cart: Product[] = [];

  categories = ['All', 'Electronics', 'Home', 'Fashion', 'Outdoors', 'Toys'];

  fakeProducts: Product[] = [
    { id: 'p1', title: 'Wireless Headphones', price: 89, rating: 4.5, category: 'Electronics', image: 'https://picsum.photos/seed/head/600/400', badge: 'Top' },
    { id: 'p2', title: 'Modern Table Lamp', price: 45, rating: 4.2, category: 'Home', image: 'https://picsum.photos/seed/lamp/600/400' },
    { id: 'p3', title: 'Athletic Sneakers', price: 120, rating: 4.7, category: 'Fashion', image: 'https://picsum.photos/seed/shoes/600/400', badge: 'New' },
    { id: 'p4', title: 'Camping Tent (2p)', price: 199, rating: 4.3, category: 'Outdoors', image: 'https://picsum.photos/seed/tent/600/400' },
    { id: 'p5', title: 'Wooden Serving Board', price: 29, rating: 4.1, category: 'Home', image: 'https://picsum.photos/seed/board/600/400' },
    { id: 'p6', title: 'Smartwatch Series 5', price: 249, rating: 4.6, category: 'Electronics', image: 'https://picsum.photos/seed/watch/600/400', badge: 'Hot' },
    { id: 'p7', title: 'Kids Building Blocks', price: 34, rating: 4.4, category: 'Toys', image: 'https://picsum.photos/seed/blocks/600/400' },
    { id: 'p8', title: 'Cozy Knit Sweater', price: 79, rating: 4.0, category: 'Fashion', image: 'https://picsum.photos/seed/sweater/600/400' }
  ];

  constructor() { }

  ngOnInit(): void { }

  get filteredProducts() {
    const q = this.search.trim().toLowerCase();
    let list = this.fakeProducts.filter(p =>
      (this.selectedCategory === 'All' || p.category === this.selectedCategory) &&
      (!q || p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
    );

    switch (this.sortBy) {
      case 'new':
        // fake stable order — in real app sort by createdAt
        list = list.slice().reverse();
        break;
      case 'price-asc':
        list = list.slice().sort((a,b)=> a.price - b.price);
        break;
      case 'price-desc':
        list = list.slice().sort((a,b)=> b.price - a.price);
        break;
      case 'popular':
      default:
        list = list.slice().sort((a,b)=> b.rating - a.rating);
    }

    return list;
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
  }

  addToCart(p: Product) {
    this.cart.push(p);
    // For demo: simple alert (replace with a toast in real app)
    alert(`"${p.title}" added to cart.`);
  }
}
