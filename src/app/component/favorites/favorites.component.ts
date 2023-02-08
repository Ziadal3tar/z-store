import { CartService } from 'src/app/services/cart.service';
import { SharedService } from 'src/app/services/shared.service';
import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProductsService } from '../../services/products.service';
import { UserService } from '../../services/user.service';
import { WishListService } from 'src/app/services/wish-list.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
})
export class FavoritesComponent implements OnInit {
  favoriteProducts: any = [];

  allIds: any = [];

  index: any;

  sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

  cc = 'text-danger';

  @Input() userData: any;

  constructor(
    private UserService: UserService,
    private ProductsService: ProductsService,
    private SharedService: SharedService,
    private WishListService: WishListService,
    private CartService: CartService
  ) {}

  ngOnInit(): void {
  }

  addToCart(id: any) {
    this.SharedService.addToCart(id);
  }

  color(event: any, id: any):any {

    for (let i = 0; i < event.target.classList.length; i++) {
      const element = event.target.classList[i];

      if (element == 'text-danger') {
        event.target.classList.remove('text-danger');
        event.target.classList.add('removed');
        return this.WishListService.removeToFavorites(id).subscribe((data: any) => {});


      }
      else if (element == 'removed') {
        event.target.classList.remove('removed');
        event.target.classList.add('text-danger');

        let data = {
          productId: id,
        };
        return this.WishListService.addToFavorites(data).subscribe((data: any) => {});
      }
    }
  }
  ondrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}
