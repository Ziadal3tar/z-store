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

interface CollectionCard {
  title: string;
  subtitle: string;
  image: string;
  query: string;
}

interface EditorialCard {
  label: string;
  title: string;
  cta: string;
  image: string;
}

interface BenefitItem {
  number: string;
  title: string;
  text: string;
}

interface TrustItem {
  title: string;
  text: string;
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

  readonly trustItems: TrustItem[] = [
    {
      title: 'Clear product details',
      text: 'Prices, offers and product information stay visible.',
    },
    {
      title: 'Secure shopping flow',
      text: 'Focused account, cart and checkout experience.',
    },
    {
      title: 'Personal wishlist',
      text: 'Keep products you want close for later.',
    },
    {
      title: 'Responsive design',
      text: 'A consistent experience across desktop and mobile.',
    },
  ];

  readonly heroSlides: HeroSlide[] = [
    {
      eyebrow: 'NEW SEASON / 2026',
      title: 'Style that moves with you.',
      subtitle:
        'Everyday essentials, elevated details and a faster way to shop.',
      image: 'assets/slider-bg.jpg',
      accent: '01',
    },
    {
      eyebrow: 'CURATED FOR YOU',
      title: 'Build your next favorite look.',
      subtitle:
        'Discover clothing and accessories selected for effortless daily wear.',
      image:
        'assets/modern-pretty-girl-beige-coat-standing-near-building-outdoor-glamorous-sunglasses-her-face-makeup-stylish-tail-hairstyle-hand-near-face-lot-summer-light-last-warm-days_343629-69.webp',
      accent: '02',
    },
    {
      eyebrow: 'LIMITED OFFERS',
      title: 'Better picks. Better prices.',
      subtitle:
        'Explore current offers before your favorites go out of stock.',
      image:
        'assets/portrait-handsome-fashion-stylish-hipster-businessman-model-dressed-elegant-brown-suit-sitting-near-dark_158538-11305.webp',
      accent: '03',
    },
  ];

  readonly collections: CollectionCard[] = [
    {
      title: 'Women',
      subtitle: 'Modern layers & everyday pieces',
      image:
        'assets/summer-portrait-cheerful-red-haired-lady-fashionable-outfit-having-fun-pink.jpg',
      query: 'women',
    },
    {
      title: 'Men',
      subtitle: 'Clean essentials & statement pieces',
      image:
        'assets/portrait-handsome-fashion-stylish-hipster-businessman-model-dressed-elegant-brown-suit-sitting-near-dark_158538-11305.webp',
      query: 'men',
    },
    {
      title: 'Accessories',
      subtitle: 'The finishing details',
      image: 'assets/13972.jpg',
      query: 'accessories',
    },
  ];

  readonly editorialCards: EditorialCard[] = [
    {
      label: '01 / DAILY',
      title: 'Everyday essentials',
      cta: 'Discover pieces',
      image:
        'assets/summer-portrait-cheerful-red-haired-lady-fashionable-outfit-having-fun-pink.jpg',
    },
    {
      label: '02 / SMART',
      title: 'Sharp layers & clean lines',
      cta: 'Explore the edit',
      image:
        'assets/portrait-handsome-fashion-stylish-hipster-businessman-model-dressed-elegant-brown-suit-sitting-near-dark_158538-11305.webp',
    },
    {
      label: '03 / DETAILS',
      title: 'Finish the look',
      cta: 'Shop accessories',
      image: 'assets/13972.jpg',
    },
  ];

  readonly benefits: BenefitItem[] = [
    {
      number: '01',
      title: 'Discover faster',
      text:
        'Clear categories and focused collections make it easier to reach the products you need.',
    },
    {
      number: '02',
      title: 'Shop with confidence',
      text:
        'Product details, pricing and availability are presented before you commit to a purchase.',
    },
    {
      number: '03',
      title: 'Keep it personal',
      text:
        'Wishlist and recently viewed products help you continue where you left off.',
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

    this.heroTimer = setInterval(
      () => this.nextHero(),
      6500,
    );
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
          this.specialOffers = (
            response?.products ?? []
          ).slice(0, 8);

          this.loadingOffers = false;
          this.cdr.markForCheck();
        },

        error: () => {
          this.specialOffers = [];
          this.loadingOffers = false;
          this.offersError =
            'We could not load the latest offers.';

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
      Number(product.price ?? 0) -
        Number(product.discount ?? 0),
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
      : this.wishListService.addToFavorites({
          productId: id,
        });

    this.subscriptions.add(
      request.subscribe({
        next: (response: any) => {
          if (response?.message === 'Done') {
            this.userState.refresh();
          }
        },

        error: error => {
          console.error(
            'wishlist update failed',
            error,
          );
        },
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
        .addToCart({
          productId: product._id,
          quantity: 1,
        })
        .subscribe({
          next: () => {
            this.userState.refresh();
          },

          error: error => {
            console.error(
              'add to cart failed',
              error,
            );
          },
        }),
    );
  }

  viewProduct(product: Product): void {
    if (!product._id) {
      return;
    }

    this.router.navigate([
      '/product',
      product._id,
    ]);
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

  trackByProductId(
    index: number,
    product: Product,
  ): string | number {
    return product._id ?? index;
  }
}
