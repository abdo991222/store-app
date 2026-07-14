import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIconsModule, Icons } from '../icons';
import { Product } from '../models';
import { money } from '../helpers';
import { BadgeComponent } from '../shared/badge.component';
import { StepperComponent } from '../shared/stepper.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, AppIconsModule, BadgeComponent, StepperComponent],
  template: `
    <div class="product-card">
      <button
        class="product-media"
        [style.background]="product.category === 'meat' ? 'linear-gradient(135deg,#F3E4E4,#EAD4D4)' : 'linear-gradient(135deg,#E4F0E9,#D4E8DC)'"
        (click)="open.emit(product)"
      >
        <span class="product-emoji">{{ product.emoji }}</span>
        <app-badge *ngIf="product.originalPrice" tone="red">خصم {{ discountPct() }}%</app-badge>
        <div class="stock-overlay" *ngIf="!product.inStock">غير متوفر</div>
      </button>
      <div class="product-body">
        <button class="product-name" (click)="open.emit(product)">{{ product.name }}</button>
        <div class="product-price-row">
          <div>
            <span class="price-now">{{ money(product.price) }}</span>
            <span class="price-old" *ngIf="product.originalPrice">{{ money(product.originalPrice) }}</span>
          </div>
          <span class="unit-tag">/{{ product.unit }}</span>
        </div>

        <ng-container *ngIf="product.inStock; else outOfStock">
          <app-stepper *ngIf="cartQty > 0; else addBtn" [value]="cartQty" (valueChange)="qtyChange.emit({ id: product.id, qty: $event })"></app-stepper>
          <ng-template #addBtn>
            <button class="btn-add" (click)="add.emit(product)">
              <lucide-angular [img]="Icons.Plus" [size]="16"></lucide-angular> أضف للسلة
            </button>
          </ng-template>
        </ng-container>
        <ng-template #outOfStock>
          <button class="btn-add btn-disabled" disabled>غير متوفر حالياً</button>
        </ng-template>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() cartQty = 0;
  @Output() open = new EventEmitter<Product>();
  @Output() add = new EventEmitter<Product>();
  @Output() qtyChange = new EventEmitter<{ id: string; qty: number }>();

  readonly Icons = Icons;
  readonly money = money;

  discountPct(): number {
    if (!this.product.originalPrice) return 0;
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }
}
