import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';

import { clearAuthToken, getAuthToken } from 'src/app/core/auth-token.util';
import { User } from 'src/app/core/models/user.model';
import { Product } from 'src/app/core/models/product.model';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { ProductsService } from '../../core/services/products.service';
import { NotificationItem } from 'src/app/core/models/notification.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { CompareService } from 'src/app/core/services/compare.service';

interface SearchProduct extends Product { displayImageUrl?: string; displayFinalPrice?: number; }

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeaderComponent implements OnInit, OnDestroy {
  openSearch = false;
  onScroll = '';
  sideCart = 'close';
  sideNav = 'close';

  userData: User | undefined;

  nameSearch = '';
  searchedProducts: SearchProduct[] = [];
  openNotifications = false;
  notifications: NotificationItem[] = [];
  notificationUnread = 0;
  compareCount = 0;
  cartCount = 0;

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  constructor(
    private readonly router: Router,
    private readonly productsService: ProductsService,
    private readonly userState: UserStateService,
    private readonly notificationService: NotificationService,
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly compareService: CompareService,
  ) {}

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.handleWindowScroll, { passive: true });
    });
    this.subscriptionsToUserState();

    this.compareService.products$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      this.compareCount = products.length;
      this.cdr.markForCheck();
    });

    if (getAuthToken()) {
      this.loadNotifications();
    }

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.openSearch = false;
        this.nameSearch = '';
        this.searchedProducts = [];
        this.openNotifications = false;
        this.sideNav = 'close';
        this.sideCart = 'close';
        this.cdr.markForCheck();
      });

    this.searchSubject
      .pipe(
        debounceTime(250),
        map(value => value.trim()),
        distinctUntilChanged(),
        switchMap(searchTerm => searchTerm
          ? this.productsService.getProducts({ page: 1, limit: 6, search: searchTerm, sort: 'featured' }).pipe(catchError(() => of(null)))
          : of(null)),
        takeUntil(this.destroy$),
      )
      .subscribe(response => {
        if (!response) {
          this.searchedProducts = [];
          this.cdr.markForCheck();
          return;
        }
        this.searchedProducts = (response.products ?? []).map(product => {
          const price = Number(product.price ?? 0);
          const finalPrice = Number(product.finalPrice ?? Math.max(0, price * (1 - Number(product.discount ?? 0) / 100)));
          const rawImage = product.images?.[0];
          return { ...product, displayImageUrl: typeof rawImage === 'string' ? rawImage : rawImage?.url || 'assets/placeholder.png', displayFinalPrice: finalPrice };
        });
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.handleWindowScroll);
    this.destroy$.next();
    this.destroy$.complete();
  }


  showNav(): void {
    this.sideNav = 'open';
  }

  private readonly handleWindowScroll = (): void => {
    const next = window.scrollY > 40 ? 'scrolled' : '';
    if (next === this.onScroll) return;
    this.onScroll = next;
    this.zone.run(() => this.cdr.markForCheck());
  };

  search(): void {
    this.searchSubject.next(this.nameSearch.trim());
  }

  openNotificationCenter(): void {
    this.openNotifications = !this.openNotifications;
    if (this.openNotifications) this.loadNotifications(true);
    this.cdr.markForCheck();
  }

  loadNotifications(force = false): void {
    if (!getAuthToken()) return;
    this.notificationService.listMine(force).subscribe({
      next: response => {
        this.notifications = response.notifications ?? [];
        this.notificationUnread = response.unread ?? 0;
        this.cdr.markForCheck();
      },
      error: () => {
        this.notifications = [];
        this.notificationUnread = 0;
        this.cdr.markForCheck();
      },
    });
  }

  viewSearchProduct(id?: string): void {
    if (!id) return;
    this.openSearch = false;
    this.nameSearch = '';
    this.searchedProducts = [];
    this.router.navigate(['/product', id]);
  }

  markAllNotificationsRead(): void {
    this.notificationService.markAllRead().subscribe({ next: () => this.loadNotifications(true) });
  }

  openNotification(item: NotificationItem): void {
    if (!item.isRead) {
      this.notificationService.markRead(item._id).subscribe({ next: () => this.loadNotifications(true) });
    }
    this.openNotifications = false;
    if (item.entityId && item.type.startsWith('order-')) {
      this.router.navigate(['/orders', item.entityId]);
    }
  }

  trackByNotification(_: number, item: NotificationItem): string { return item._id; }
  trackBySearchProduct(_: number, item: SearchProduct): string | number { return item._id || _; }

  logout(): void {
    clearAuthToken();
    this.userState.clear();
    this.router.navigate(['/login']);
  }

  private subscriptionsToUserState(): void {
    // Seed the initial value synchronously so an OnPush header never waits for a navigation to render auth state.
    this.userData = this.userState.snapshot;
    this.cartCount = (this.userData?.cartId?.products ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
    this.userState.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.userData = user;
        this.cartCount = (user?.cartId?.products ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
        this.cdr.markForCheck();
      });
  }
}
