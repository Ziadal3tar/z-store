import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { clearAuthToken, getAuthToken } from 'src/app/core/auth-token.util';
import { User } from 'src/app/core/models/user.model';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { ProductsService } from '../../services/products.service';
import { StoresService } from './../../services/stores.service';

interface StoreSearchItem {
  _id?: string;
  name?: string;
  createdBy?: string;
  storeProduct?: Array<{ productId?: string }>;
  storeImage?: string;
}

interface StoreSearchResponse {
  allstores?: StoreSearchItem[];
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() cartlength:any = 0;

  openSearch = false;
  onScroll = '';
  sideCart = 'close';
  sideNav = 'close';

  subtotal = 0;
  userData: User | undefined;

  nameSearch = '';
  searched: StoreSearchItem[] = [];

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  constructor(
    private readonly router: Router,
    private readonly productsService: ProductsService,
    private readonly storesService: StoresService,
    private readonly userState: UserStateService,
  ) {}

  ngOnInit(): void {
    this.subscriptionsToUserState();

    if (getAuthToken()) {
      this.userState.refresh();
    }

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe(searchTerm => this.executeSearch(searchTerm));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  Subtotal(): void {
    const products = this.userData?.cartId?.products ?? [];

    this.subtotal = products.reduce((total, item) => {
      const quantity = Number(item?.quantity ?? 0);
      const price = Number(item?.productId?.finalPrice ?? 0);
      return total + quantity * price;
    }, 0);
  }

  showNav(): void {
    this.sideNav = 'open';
  }

  @HostListener('window:scroll')
  toKnowHeight(): void {
    this.onScroll = window.scrollY > 40 ? 'scrolled' : '';
  }

  search(): void {
    this.searchSubject.next(this.nameSearch.trim());
  }

  private executeSearch(searchTerm: string): void {
    if (!searchTerm) {
      this.searched = [];
      return;
    }

    this.storesService
      .searchStore({ name: searchTerm })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: StoreSearchResponse) => {
          this.searched = Array.isArray(response?.allstores)
            ? response.allstores
            : [];
        },
        error: () => {
          this.searched = [];
        },
      });
  }

  removeStore(id: any): void {
    if (!id) {
      return;
    }

    this.storesService
      .removeStore(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: {
          message?: string;
          deletedStore?: StoreSearchItem;
        }) => {
          if (response?.message !== 'deleted') {
            return;
          }

          this.searched = this.searched.filter(item => item?._id !== id);

          const deletedStore = response.deletedStore;
          if (!deletedStore) {
            return;
          }

          if (deletedStore.createdBy) {
            this.storesService
              .storDeleted(deletedStore.createdBy)
              .pipe(takeUntil(this.destroy$))
              .subscribe();
          }

          (deletedStore.storeProduct ?? []).forEach(item => {
            if (!item?.productId) {
              return;
            }

            this.productsService
              .deleteProductById(item.productId)
              .pipe(takeUntil(this.destroy$))
              .subscribe();
          });
        },
        error: () => {
          // Authentication/server errors are handled centrally.
        },
      });
  }

  logout(): void {
    clearAuthToken();
    this.userState.clear();
    this.router.navigate(['/login']);
  }

  private subscriptionsToUserState(): void {
    this.userState.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.userData = user;
        this.Subtotal();
      });
  }
}
