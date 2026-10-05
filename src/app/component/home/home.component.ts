import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CartService } from './../../core/services/cart.service';
import { WishListService } from './../../core/services/wish-list.service';
import { ProductsService } from '../../core/services/products.service';
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
  currentHero = 0;

  specialOffers: Product[] = [];
  bestSelling: Product[] = [];
  newArrivals: Product[] = [];
  recentlyViewed: Product[] = [];
  readonly specialOfferPreview: Product[] = [];
  readonly bestSellingPreview: Product[] = [];
  readonly newArrivalsPreview: Product[] = [];
  readonly recentlyViewedPreview: Product[] = [];
  categories: Array<{ _id: string; name: string; image?: string }> = [];
  brands: Array<{ _id: string; name: string; image?: string }> = [];
  flashHours = 0;
  flashMinutes = 0;
  flashSeconds = 0;
  flashHoursLabel = '00';
  flashMinutesLabel = '00';
  flashSecondsLabel = '00';
  currentHeroLabel = '01';
  heroTotalLabel = '03';

  userData: any;
  loginFirst = false;

  productDetails?: Product;
  openProductDetails = false;

  loadingOffers = true;
  offersError = '';
  private wishlistIds = new Set<string>();

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
  private flashTimer?: ReturnType<typeof setInterval>;
  private flashEndsAt = Date.now() + (6 * 60 * 60 * 1000);

  constructor(
    private readonly productsService: ProductsService,
    private readonly userState: UserStateService,
    private readonly wishListService: WishListService,
    private readonly cartService: CartService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly recentlyViewedService: RecentlyViewedService,
    private readonly zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.userState.user$.subscribe(user => {

        this.userData = user;
        this.wishlistIds = new Set(
          (user?.wishlist ?? []).map((item: any) => item?._id).filter(Boolean)
        );

        this.specialOffers = this.specialOffers.map((product) => this.toViewProduct(product));
        this.syncPreviewLists();

        this.cdr.markForCheck();
      }),
    );

    this.recentlyViewed = this.recentlyViewedService.get().map((product: Product) => this.toViewProduct(product));
    this.syncPreviewLists();
    this.loadHomeFeed();
    this.updateHeroLabels();
    this.updateFlashCountdown();
    this.zone.runOutsideAngular(() => {
      this.heroTimer = setInterval(() => this.zone.run(() => this.nextHero()), 6500);
      this.flashTimer = setInterval(() => this.zone.run(() => this.updateFlashCountdown()), 1000);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();

    if (this.heroTimer) clearInterval(this.heroTimer);
    if (this.flashTimer) clearInterval(this.flashTimer);
  }

  nextHero(): void {
    this.currentHero =
      (this.currentHero + 1) % this.heroSlides.length;
    this.updateHeroLabels();
    this.cdr.markForCheck();
  }

  previousHero(): void {
    this.currentHero =
      (this.currentHero - 1 + this.heroSlides.length) %
      this.heroSlides.length;
    this.updateHeroLabels();
    this.cdr.markForCheck();
  }

  selectHero(index: number): void {
    this.currentHero = index;
    this.updateHeroLabels();
    this.cdr.markForCheck();
  }

  shopCollection(query: string): void {
    this.router.navigate(['/shop'], { queryParams: query ? { search: query } : undefined });
  }

  loadHomeFeed(): void {
    this.loadingOffers = true;
    this.offersError = '';
    this.subscriptions.add(
      this.productsService.getHomeFeed().subscribe({
        next: feed => {
          this.specialOffers = (feed.special ?? []).slice(0, 8).map(product => this.toViewProduct(product));
          this.bestSelling = (feed.bestSelling ?? []).slice(0, 8).map(product => this.toViewProduct(product));
          this.newArrivals = (feed.newArrivals ?? []).slice(0, 8).map(product => this.toViewProduct(product));
          this.syncPreviewLists();
          this.categories = feed.categories ?? [];
          this.brands = feed.brands ?? [];
          this.loadingOffers = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.specialOffers = []; this.bestSelling = []; this.newArrivals = []; this.loadingOffers = false;
          this.offersError = 'We could not load the latest catalog highlights.';
          this.cdr.markForCheck();
        },
      }),
    );
  }

  loadSpecialOffers(): void { this.loadHomeFeed(); }

  updateFlashCountdown(): void {
    const remaining = Math.max(0, this.flashEndsAt - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    this.flashHours = Math.floor(totalSeconds / 3600);
    this.flashMinutes = Math.floor((totalSeconds % 3600) / 60);
    this.flashSeconds = totalSeconds % 60;
    this.flashHoursLabel = this.formatTime(this.flashHours);
    this.flashMinutesLabel = this.formatTime(this.flashMinutes);
    this.flashSecondsLabel = this.formatTime(this.flashSeconds);
    this.cdr.markForCheck();
  }



  private syncPreviewLists(): void {
    this.specialOfferPreview.splice(0, this.specialOfferPreview.length, ...this.specialOffers.slice(1, 6));
    this.bestSellingPreview.splice(0, this.bestSellingPreview.length, ...this.bestSelling.slice(0, 4));
    this.newArrivalsPreview.splice(0, this.newArrivalsPreview.length, ...this.newArrivals.slice(0, 4));
    this.recentlyViewedPreview.splice(0, this.recentlyViewedPreview.length, ...this.recentlyViewed.slice(0, 4));
  }

  private updateHeroLabels(): void {
    this.currentHeroLabel = String(this.currentHero + 1).padStart(2, '0');
    this.heroTotalLabel = String(this.heroSlides.length).padStart(2, '0');
  }

  private formatTime(value: number): string {
    return String(value).padStart(2, '0');
  }

  private toViewProduct(product: Product): Product {
    const price = Number(product.price ?? 0);
    const finalPrice = product.finalPrice != null
      ? Number(product.finalPrice)
      : Math.max(0, price * (1 - Number(product.discount ?? 0) / 100));

    return {
      ...product,
      displayImageUrl: typeof product.images?.[0] === 'string'
        ? product.images[0] as string
        : (product.images?.[0] as any)?.url ?? 'assets/placeholder.png',
      displayFinalPrice: finalPrice,
      displayOldPrice: finalPrice < price ? price : null,
      displayDiscountPercent: Number(product.discount ?? 0),
      isWishlisted: !!product._id && this.wishlistIds.has(product._id),
    };
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

    const request = product.isWishlisted
      ? this.wishListService.removeToFavorites(id)
      : this.wishListService.addToFavorites({ productId: id });

    this.subscriptions.add(
      request.subscribe({
        next: (response: any) => {
          if (response?.message === 'Done') {
            this.userState.updateWishlist(id, !product.isWishlisted);
            this.applyWishlistState(id, !product.isWishlisted);
          }
        },
        error: error => console.error('wishlist update failed', error),
      }),
    );
  }

  private applyWishlistState(id: string, isWishlisted: boolean): void {
    const update = (products: Product[]) => products.map(item => item._id === id ? { ...item, isWishlisted } : item);
    this.specialOffers = update(this.specialOffers);
    this.bestSelling = update(this.bestSelling);
    this.newArrivals = update(this.newArrivals);
    this.syncPreviewLists();
    this.cdr.markForCheck();
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
        .addToCart({ productId: product._id, quantity: 1 }, product)
        .subscribe({
          next: response => this.userState.updateCart(response?.cart),
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

  trackByCategory(index: number, category: { _id: string }): string | number {
    return category._id || index;
  }

  trackByBrand(index: number, brand: { _id: string }): string | number {
    return brand._id || index;
  }
}
