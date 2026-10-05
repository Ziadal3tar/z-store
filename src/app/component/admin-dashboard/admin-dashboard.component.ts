import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

type AdminTabId =
  | 'dashboard'
  | 'coupons'
  | 'categories'
  | 'subcategories'
  | 'brands'
  | 'products'
  | 'users'
  | 'orders';

interface AdminTab {
  id: AdminTabId;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  activeTab: AdminTabId = 'dashboard';

  readonly tabs: AdminTab[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      description: 'Store administration',
      icon: 'bi bi-grid-1x2',
    },
    {
      id: 'orders',
      label: 'Orders',
      description: 'Fulfillment control',
      icon: 'bi bi-receipt',
    },
    {
      id: 'products',
      label: 'Products',
      description: 'Add and manage items',
      icon: 'bi bi-box-seam',
    },
    {
      id: 'users',
      label: 'Customers',
      description: 'Users and administrators',
      icon: 'bi bi-people',
    },
    {
      id: 'coupons',
      label: 'Coupons',
      description: 'Discount campaigns',
      icon: 'bi bi-ticket-perforated',
    },
    {
      id: 'categories',
      label: 'Categories',
      description: 'Main catalog groups',
      icon: 'bi bi-collection',
    },
    {
      id: 'subcategories',
      label: 'Subcategories',
      description: 'Catalog organization',
      icon: 'bi bi-diagram-3',
    },
    {
      id: 'brands',
      label: 'Brands',
      description: 'Brand management',
      icon: 'bi bi-award',
    },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.queryParamMap.subscribe((params) => {
        const requestedTab = params.get('tab') as AdminTabId | null;
        this.activeTab = this.isValidTab(requestedTab) ? requestedTab : 'dashboard';
      }),
    );
  }

  selectTab(tab: AdminTabId): void {
    if (this.activeTab === tab) return;

    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private isValidTab(value: AdminTabId | null): value is AdminTabId {
    return !!value && this.tabs.some((tab) => tab.id === value);
  }
}
