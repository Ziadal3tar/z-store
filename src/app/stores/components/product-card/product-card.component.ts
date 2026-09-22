import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../services/products.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() add = new EventEmitter<string>();
  @Output() open = new EventEmitter<string>();
  @Output() wish = new EventEmitter<string>();

  get imageUrl(): string {
    const image = this.product.images?.[0];
    return typeof image === 'string' ? image : image?.url ?? 'assets/placeholder.png';
  }

  get finalPrice(): number {
    if (this.product.finalPrice != null) return Number(this.product.finalPrice);
    return Math.max(0, Number(this.product.price ?? 0) - Number(this.product.discount ?? 0));
  }

  get outOfStock(): boolean {
    return Number(this.product.totalItems ?? 0) <= 0;
  }
}
