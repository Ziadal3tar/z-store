import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SeoService } from './core/services/seo.service';
import { getAuthToken } from './core/auth-token.util';
import { UserStateService } from './core/state/user-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  showSiteHeader = true;
  showSiteFooter = true;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly seo: SeoService,
    private readonly userState: UserStateService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (getAuthToken()) {
      this.userState.refresh().subscribe();
    }

    this.syncGlobalChrome(this.router.url);
    this.seo.setPage('Home');

    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.updateRouteSeo();
          this.cdr.markForCheck();
        }),
    );
  }

  private updateRouteSeo(): void {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const title = route.snapshot.data['title'] ?? 'Shop';
    const description = route.snapshot.data['description'];
    this.seo.setPage(title, description);
    this.syncGlobalChrome(this.router.url);
  }

  private syncGlobalChrome(url: string): void {
    const pathname = url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
    const authPage = pathname === '/login' || pathname === '/signup';
    this.showSiteHeader = !authPage;
    this.showSiteFooter = !authPage;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
