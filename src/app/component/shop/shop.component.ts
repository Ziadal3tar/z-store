import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { Product } from 'src/app/core/models/product.model';
import { User } from 'src/app/core/models/user.model';
import { CatalogStateService } from 'src/app/core/state/catalog-state.service';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { CartService } from '../../core/services/cart.service';
import { WishListService } from '../../core/services/wish-list.service';
import { ProductsService } from '../../core/services/products.service';
import { CompareService } from '../../core/services/compare.service';

interface PriceRange { min: number | null; max: number | null; }
type SortOption = 'featured' | 'newest' | 'best-selling' | 'price-low' | 'price-high' | 'rating-high' | 'discount-high' | 'name';
type FilterRelation = { _id?: string; name?: string };

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  private readonly searchInput$ = new Subject<string>();

  userData?: User;
  products: Product[] = [];
  categories: FilterRelation[] = [];
  brands: FilterRelation[] = [];

  searchTerm = '';
  sortBy: SortOption = 'featured';
  selectedColor = '';
  selectedCategory = '';
  selectedBrand = '';
  selectedPrice: PriceRange = { min: null, max: null };
  inStockOnly = false;
  minimumRating = 0;

  showFilters = false;
  loginFirst = false;
  isLoading = true;
  hasActiveFilters = false;
  productDetails?: Product;
  openProductDetails = false;

  currentPage = 1;
  pageSize = 12;
  totalPages = 0;
  totalProducts = 0;
  paginationPages: Array<number | string> = [];

  readonly skeletonItems = Array.from({ length: 8 }, (_, index) => index + 1);
  readonly favoriteBusy: Record<string, boolean> = {};
  readonly cartBusy: Record<string, boolean> = {};
  private wishlistIds = new Set<string>();
  compareIds = new Set<string>();

  readonly colors = ['black','red','blue','green','yellow','white','orange','brown','gray','pink','beige','navy'];
  readonly priceRanges = [
    { label: 'Under $50', range: { min: null, max: 50 } },
    { label: '$50 – $100', range: { min: 50, max: 100 } },
    { label: '$100 – $250', range: { min: 100, max: 250 } },
    { label: '$250 – $500', range: { min: 250, max: 500 } },
    { label: '$500+', range: { min: 500, max: null } },
  ];

  constructor(
    private readonly productsService: ProductsService,
    private readonly catalogState: CatalogStateService,
    private readonly userState: UserStateService,
    private readonly cartService: CartService,
    private readonly wishListService: WishListService,
    private readonly compareService: CompareService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(this.searchInput$.pipe(debounceTime(280), distinctUntilChanged()).subscribe(value => {
      this.searchTerm = value.trim();
      this.currentPage = 1;
      this.loadProducts();
    }));

    this.subscriptions.add(this.userState.user$.subscribe(user => {
      this.userData = user;
      this.wishlistIds = new Set((user?.wishlist ?? []).map(item => item?._id).filter((id): id is string => !!id));
      this.products = this.products.map(product => this.toViewProduct(product));
      this.cdr.markForCheck();
    }));

    this.subscriptions.add(this.compareService.products$.subscribe(products => {
      this.compareIds = new Set(products.map(product => product._id).filter((id): id is string => !!id));
      this.cdr.markForCheck();
    }));

    this.subscriptions.add(this.catalogState.categories$.subscribe(items => { this.categories = items; this.cdr.markForCheck(); }));
    this.subscriptions.add(this.catalogState.brands$.subscribe(items => { this.brands = items; this.cdr.markForCheck(); }));

    this.subscriptions.add(this.catalogState.products$.subscribe(products => {
      this.products = products.map(product => this.toViewProduct(product));
      this.isLoading = false;
      this.cdr.markForCheck();
    }));

    this.subscriptions.add(this.catalogState.productPagination$.subscribe(pagination => {
   this.currentPage = pagination.page ?? 1;
this.pageSize = pagination.limit ?? 12;
      this.totalPages = pagination.totalPages;
      this.totalProducts = pagination.total;
      this.updatePaginationPages();
      this.cdr.markForCheck();
    }));

    const params = this.route.snapshot.queryParamMap;
    this.searchTerm = params.get('search')?.trim() ?? '';
    this.selectedCategory = params.get('category') ?? '';
    this.selectedBrand = params.get('brand') ?? '';
    this.loadProducts();
  }

  ngOnDestroy(): void { this.searchInput$.complete(); this.subscriptions.unsubscribe(); }

  private loadProducts(): void {
    this.isLoading = true;
    this.updateActiveFilterState();
    this.catalogState.refreshProducts(this.currentPage, this.pageSize, this.searchTerm, {
      category: this.selectedCategory,
      brand: this.selectedBrand,
      color: this.selectedColor,
      minPrice: this.selectedPrice.min,
      maxPrice: this.selectedPrice.max,
      sort: this.sortBy,
      inStockOnly: this.inStockOnly,
      minimumRating: this.minimumRating,
    });
    this.cdr.markForCheck();
  }

  onSearchChange(value: string): void { this.searchInput$.next(value); }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (this.showFilters) {
      this.catalogState.refreshCategories();
      this.catalogState.refreshBrands();
    }
    this.cdr.markForCheck();
  }
  clearSearch(): void { this.searchTerm = ''; this.currentPage = 1; this.loadProducts(); }

  resetFilters(): void {
    this.searchTerm = '';
    this.sortBy = 'featured';
    this.selectedColor = '';
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.selectedPrice = { min: null, max: null };
    this.inStockOnly = false;
    this.minimumRating = 0;
    this.currentPage = 1;
    this.showFilters = false;
    this.loadProducts();
  }

  selectPrice(range: PriceRange): void { this.selectedPrice = { ...range }; this.currentPage = 1; this.loadProducts(); }
  clearPriceFilter(): void { this.selectedPrice = { min: null, max: null }; this.currentPage = 1; this.loadProducts(); }
  selectColor(color: string): void { this.selectedColor = this.selectedColor === color ? '' : color; this.currentPage = 1; this.loadProducts(); }
  clearColorFilter(): void { this.selectedColor = ''; this.currentPage = 1; this.loadProducts(); }
  selectCategory(id: string): void { this.selectedCategory = this.selectedCategory === id ? '' : id; this.currentPage = 1; this.loadProducts(); }
  selectBrand(id: string): void { this.selectedBrand = this.selectedBrand === id ? '' : id; this.currentPage = 1; this.loadProducts(); }
  clearCategoryFilter(): void { this.selectedCategory = ''; this.currentPage = 1; this.loadProducts(); }
  clearBrandFilter(): void { this.selectedBrand = ''; this.currentPage = 1; this.loadProducts(); }
  setInStockOnly(value: boolean): void { this.inStockOnly = value; this.currentPage = 1; this.loadProducts(); }
  setMinimumRating(value: number): void { this.minimumRating = Number(value) || 0; this.currentPage = 1; this.loadProducts(); }
  onSortChange(value: SortOption): void { this.sortBy = value; this.currentPage = 1; this.loadProducts(); }

  private updateActiveFilterState(): void {
    this.hasActiveFilters = !!this.searchTerm || !!this.selectedColor || !!this.selectedCategory || !!this.selectedBrand || this.selectedPrice.min != null || this.selectedPrice.max != null || this.inStockOnly || this.minimumRating > 0;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updatePaginationPages(): void {
    if (this.totalPages <= 7) { this.paginationPages = Array.from({ length: this.totalPages }, (_, index) => index + 1); return; }
    const pages: Array<number | string> = [1];
    if (this.currentPage > 4) pages.push('…');
    for (let page = Math.max(2, this.currentPage - 1); page <= Math.min(this.totalPages - 1, this.currentPage + 1); page++) pages.push(page);
    if (this.currentPage < this.totalPages - 3) pages.push('…');
    pages.push(this.totalPages);
    this.paginationPages = pages;
  }

  private toViewProduct(product: Product): Product {
    const price = Number(product.price ?? 0);
    const finalPrice = product.finalPrice != null ? Number(product.finalPrice) : Math.max(0, price * (1 - Number(product.discount ?? 0) / 100));
    const image = product.images?.[0];
    const raw = typeof image === 'string' ? image : image?.url ?? 'assets/placeholder.png';
    return {
      ...product,
      displayImageUrl: this.optimizeCloudinaryImage(raw),
      displayFinalPrice: finalPrice,
      displayOldPrice: finalPrice < price ? price : null,
      displayDiscountPercent: Number(product.discount ?? 0),
      isWishlisted: !!product._id && this.wishlistIds.has(product._id),
    };
  }

  private optimizeCloudinaryImage(url: string): string {
    if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;
    if (url.includes('f_auto') || url.includes('q_auto')) return url;
    return url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_600,c_limit/');
  }

  addToCart(product: Product): void {
    if (!this.userData) { this.loginFirst = true; this.cdr.markForCheck(); return; }
    const id = product._id;
    if (!id || product.stock === 0 || this.cartBusy[id]) return;
    this.cartBusy[id] = true;
    this.cdr.markForCheck();
    this.cartService.addToCart({ productId: id, quantity: 1 }, product).subscribe({
      next: response => {
        this.userState.updateCart(response.cart);
        this.cartBusy[id] = false;
        this.cdr.markForCheck();
      },
      error: error => { console.error('Add to cart failed', error); this.cartBusy[id] = false; this.cdr.markForCheck(); },
    });
  }

  addToFavorites(product: Product): void {
    if (!this.userData) { this.loginFirst = true; this.cdr.markForCheck(); return; }
    const id = product._id;
    if (!id || this.favoriteBusy[id]) return;
    this.favoriteBusy[id] = true;
    const request = product.isWishlisted ? this.wishListService.removeToFavorites(id) : this.wishListService.addToFavorites({ productId: id });
    request.subscribe({
      next: () => {
        const nextWishlist = product.isWishlisted ? (this.userData?.wishlist ?? []).filter(item => item._id !== id) : [...(this.userData?.wishlist ?? []), product];
        this.userData = { ...this.userData!, wishlist: nextWishlist };
        this.userState.setUserData(this.userData);
        this.wishlistIds = new Set(nextWishlist.map(item => item._id).filter((value): value is string => !!value));
        this.products = this.products.map(item => item._id === id ? this.toViewProduct(item) : item);
        this.favoriteBusy[id] = false;
        this.cdr.markForCheck();
      },
      error: error => { console.error('Wishlist update failed', error); this.favoriteBusy[id] = false; this.cdr.markForCheck(); },
    });
  }

  viewProduct(product: Product): void { if (product._id) this.router.navigate(['/product', product._id]); }
  openQuickView(product: Product): void { this.productDetails = product; this.openProductDetails = true; this.cdr.markForCheck(); }
  closeQuickView(): void { this.openProductDetails = false; this.productDetails = undefined; this.cdr.markForCheck(); }
  toggleCompare(product: Product): void { this.compareService.toggle(product); this.cdr.markForCheck(); }
  isCompared(product: Product): boolean { return !!product._id && this.compareIds.has(product._id); }
  trackByProductId(index: number, product: Product): string | number { return product._id ?? index; }
}
