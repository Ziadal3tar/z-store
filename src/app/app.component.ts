import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SeoService } from './core/services/seo.service';

declare const AOS: {
  init: (options?: { once?: boolean; duration?: number; offset?: number }) => void;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
 
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    AOS.init({ once: true, duration: 650, offset: 60 });
    this.seo.setPage('Home');

    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => this.updateRouteSeo()),
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
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
