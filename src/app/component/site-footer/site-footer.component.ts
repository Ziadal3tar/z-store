import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { NewsletterService } from 'src/app/core/services/newsletter.service';

@Component({ selector: 'app-site-footer', templateUrl: './site-footer.component.html', styleUrls: ['./site-footer.component.css'], changeDetection: ChangeDetectionStrategy.OnPush })
export class SiteFooterComponent {
  readonly currentYear = new Date().getFullYear();
  email = '';
  newsletterMessage = '';
  newsletterError = '';
  subscribing = false;

  constructor(
    private readonly newsletterService: NewsletterService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  subscribe(): void {
    const email = this.email.trim();
    if (!email || this.subscribing) return;
    this.newsletterMessage = '';
    this.newsletterError = '';
    this.subscribing = true;
    this.newsletterService.subscribe(email).subscribe({
      next: response => {
        this.subscribing = false;
        this.email = '';
        this.newsletterMessage = response.message;
        this.cdr.markForCheck();
      },
      error: error => {
        this.subscribing = false;
        this.newsletterError = error?.error?.message || 'Unable to subscribe right now.';
        this.cdr.markForCheck();
      },
    });
  }
}
