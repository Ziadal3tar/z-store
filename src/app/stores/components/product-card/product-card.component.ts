import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-product-card',
  template: `
    <div class="product-card">
      <div class="thumb-wrap" (click)="open.emit(product._id)">
        <img [src]="product.images?.[0]?.url ?? '/assets/placeholder.png'" alt="{{product.title}}" loading="lazy" />
      </div>
      <div class="info">
        <h4 (click)="open.emit(product._id)">{{ product.title }}</h4>
        <div class="price">{{ product.price | currency }}</div>
        <div class="meta">
          <span *ngIf="product.quantity <= 0" class="oos">Out of stock</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn" (click)="add.emit(product._id)" [disabled]="product.quantity <= 0">Add</button>
        <button class="btn ghost" (click)="wish.emit(product._id)">♡</button>
      </div>
    </div>
  `,
  styles: [`
    .product-card { display:flex; flex-direction:column; gap:10px; border-radius:8px; padding:12px; background:#fff; box-shadow:0 4px 10px rgba(0,0,0,0.04); }
    .thumb-wrap { width:100%; height:180px; overflow:hidden; border-radius:6px; cursor:pointer; }
    .thumb-wrap img{ width:100%; height:100%; object-fit:cover; display:block; }
    .info h4{ margin:0; font-size:1rem; cursor:pointer; }
    .price{ font-weight:700; margin-top:6px; }
    .actions{ display:flex; gap:8px; }
    .btn{ padding:8px 10px; border-radius:6px; cursor:pointer; }
    .btn.ghost{ background:transparent; border:1px solid #eee; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  @Input() product: any;
  @Output() add = new EventEmitter<string>();
  @Output() open = new EventEmitter<string>();
  @Output() wish = new EventEmitter<string>();
}
