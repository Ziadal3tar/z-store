import { getAuthToken } from 'src/app/core/auth-token.util';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CartService } from './../../services/cart.service';
import { WishListService } from './../../services/wish-list.service';
import { ProductsService } from '../../services/products.service';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { Product } from 'src/app/core/models/product.model';
import { RecentlyViewedService } from 'src/app/core/services/recently-viewed.service';

interface HeroSlide {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  accent: string;
}

interface MoodCard {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  query: string;
}

interface SignalStat {
  label: string;
  value: string;
  text: string;
}

interface LookBoard {
  title: string;
  description: string;
  image: string;
  query: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  cartlength = 0;
  currentHero = 0;

  specialOffers: Product[] = [];
  recentlyViewed: Product[] = [];

  userData: any;
  loginFirst = false;

  productDetails?: Product;
  openProductDetails = false;

  loadingOffers = true;
  offersError = '';

  readonly heroSlides: HeroSlide[] = [
    {
      eyebrow: 'NEW SEASON / OBJECT 01',
      title: 'Your next favorite thing is not in the cart yet.',
      subtitle:
        'A tighter edit of everyday pieces, sharper layers and details that change the whole look.',
      image: 'assets/photo-1716971550641-d61ba802d4a5.avif',
      accent: '01',
    },
    {
      eyebrow: 'CURATED / OBJECT 02',
      title: 'Build a look around one good idea.',
      subtitle:
        'Start with one piece and let the rest of the wardrobe follow its lead.',
      image:
        'assets/photo-1580657018950-c7f7d6a6d990.avif',
      accent: '02',
    },
    {
      eyebrow: 'LIMITED / OBJECT 03',
      title: 'Good style does not need a long explanation.',
      subtitle:
        'Current offers, clear product details and fewer clicks between you and the right pick.',
      image: 'assets/photo-1599012307530-d163bd04ecab.avif',
      accent: '03',
    },
  ];

  readonly moods: MoodCard[] = [
    {
      eyebrow: 'MOOD 01 / EASY',
      title: 'Soft Utility',
      description: 'Relaxed shapes, light layers and everyday movement.',
      image:
        'assets/photo-1625698311031-f0dd15be5144.avif',
      query: 'women',
    },
    {
      eyebrow: 'MOOD 02 / CLEAN',
      title: 'Quiet Form',
      description: 'Neutral tones and pieces that do the work without shouting.',
      image:
        'assets/istockphoto-2254562888-612x612.webp',
      query: 'men',
    },
    {
      eyebrow: 'MOOD 03 / DETAIL',
      title: 'Small Signal',
      description: 'Accessories and finishing touches that change the whole frame.',
      image: 'assets/istockphoto-2268655195-612x612.webp',
      query: 'accessories',
    },
    {
      eyebrow: 'MOOD 04 / AFTER HOURS',
      title: 'Sharp After Dark',
      description: 'A darker edit for plans that start late and stay longer.',
      image:
        'assets/photo-1532453288672-3a27e9be9efd.avif',
      query: 'men',
    },
  ];

  readonly signalItems = [
    'FAST DISCOVERY',
    'CLEAR PRICING',
    'WISHLIST READY',
    'QUICK VIEW',
    'RESPONSIVE BY DEFAULT',
  ];

  readonly signalStats: SignalStat[] = [
    {
      label: '01 / SEARCH',
      value: 'DIRECT',
      text: 'Go from an idea to the relevant part of the catalog quickly.',
    },
    {
      label: '02 / PRODUCT',
      value: 'VISIBLE',
      text: 'Price, discount and product information stay in view.',
    },
    {
      label: '03 / CHECKOUT',
      value: 'FOCUSED',
      text: 'Fewer distractions once you have found the right piece.',
    },
  ];

  readonly lookBoards: LookBoard[] = [
    {
      title: 'Start with one statement',
      description: 'A hero piece first. Everything else follows.',
      image: 'assets/photo-1716971550641-d61ba802d4a5.avif',
      query: 'men',
    },
    {
      title: 'Keep the base easy',
      description: 'Everyday pieces that make the outfit easier to wear.',
       image: 'assets/photo-1580657018950-c7f7d6a6d990.avif',
      query: 'women',
    },
    {
      title: 'Finish with detail',
      description: 'Use accessories to make the look feel intentional.',
      image: 'assets/photo-1599012307530-d163bd04ecab.avif',
      query: 'accessories',
    },
  ];

  private readonly subscriptions = new Subscription();
  private heroTimer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly productsService: ProductsService,
    private readonly userState: UserStateService,
    private readonly wishListService: WishListService,
    private readonly cartService: CartService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly recentlyViewedService: RecentlyViewedService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.userState.user$.subscribe(user => {
        this.userData = user;

        this.cartlength =
          user?.cartId?.products?.reduce(
            (count: number, item: any) =>
              count + Number(item?.quantity ?? 0),
            0,
          ) ?? 0;

        this.cdr.markForCheck();
      }),
    );

    if (getAuthToken()) {
      this.userState.refresh();
    }

    this.recentlyViewed = this.recentlyViewedService.get();
    this.loadSpecialOffers();

    this.heroTimer = setInterval(() => this.nextHero(), 6500);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();

    if (this.heroTimer) {
      clearInterval(this.heroTimer);
    }
  }

  nextHero(): void {
    this.currentHero =
      (this.currentHero + 1) % this.heroSlides.length;
    this.cdr.markForCheck();
  }

  previousHero(): void {
    this.currentHero =
      (this.currentHero - 1 + this.heroSlides.length) %
      this.heroSlides.length;
    this.cdr.markForCheck();
  }

  selectHero(index: number): void {
    this.currentHero = index;
    this.cdr.markForCheck();
  }

  shopCollection(_query: string): void {
    this.router.navigate(['/shop']);
  }

  loadSpecialOffers(): void {
    this.loadingOffers = true;
    this.offersError = '';

    this.subscriptions.add(
      this.productsService.getSpecialOffers().subscribe({
        next: (response: any) => {
          this.specialOffers = (response?.products ?? []).slice(0, 8);
          this.loadingOffers = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.specialOffers = [];
          this.loadingOffers = false;
          this.offersError = 'We could not load the latest offers.';
          this.cdr.markForCheck();
        },
      }),
    );
  }

  imageUrl(product: Product): string {
    const image = product.images?.[0];

    if (typeof image === 'string') {
      return image;
    }

    return image?.url ?? 'assets/placeholder.png';
  }

  finalPrice(product: Product): number {
    if (product.finalPrice != null) {
      return Number(product.finalPrice);
    }

    return Math.max(
      0,
      Number(product.price ?? 0) - Number(product.discount ?? 0),
    );
  }

  oldPrice(product: Product): number | null {
    const price = Number(product.price ?? 0);
    const finalPrice = this.finalPrice(product);

    return finalPrice < price ? price : null;
  }

  ifInWishlist(product: Product): boolean {
    return !!this.userData?.wishlist?.some(
      (item: any) => item?._id === product?._id,
    );
  }

  addToFavorites(product: Product): void {
    if (!this.userData) {
      this.loginFirst = true;
      this.cdr.markForCheck();
      return;
    }

    const id = product._id;
    if (!id) {
      return;
    }

    const request = this.ifInWishlist(product)
      ? this.wishListService.removeToFavorites(id)
      : this.wishListService.addToFavorites({ productId: id });

    this.subscriptions.add(
      request.subscribe({
        next: (response: any) => {
          if (response?.message === 'Done') {
            this.userState.refresh();
          }
        },
        error: error => console.error('wishlist update failed', error),
      }),
    );
  }

  addToCart(product: Product): void {
    if (!this.userData) {
      this.loginFirst = true;
      this.cdr.markForCheck();
      return;
    }

    if (!product._id) {
      return;
    }

    this.subscriptions.add(
      this.cartService
        .addToCart({ productId: product._id, quantity: 1 })
        .subscribe({
          next: () => this.userState.refresh(),
          error: error => console.error('add to cart failed', error),
        }),
    );
  }

  viewProduct(product: Product): void {
    if (!product._id) {
      return;
    }

    this.router.navigate(['/product', product._id]);
  }

  openQuickView(product: Product): void {
    this.productDetails = product;
    this.openProductDetails = true;
    this.cdr.markForCheck();
  }

  closeQuickView(): void {
    this.openProductDetails = false;
    this.productDetails = undefined;
    this.cdr.markForCheck();
  }

  trackByProductId(index: number, product: Product): string | number {
    return product._id ?? index;
  }
}
