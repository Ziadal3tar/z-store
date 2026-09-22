import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly siteName = 'Z-Store';
  private readonly defaultDescription = 'A modern full-stack e-commerce platform for discovering products, managing carts and running online stores.';

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
  ) {}

  setPage(title: string, description = this.defaultDescription): void {
    const pageTitle = title ? `${title} | ${this.siteName}` : this.siteName;
    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
  }
}
