import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIconsModule, Icons } from '../icons';
import { StoreService } from '../services/store.service';
import { money } from '../helpers';
import { BadgeComponent } from '../shared/badge.component';
import { StepperComponent } from '../shared/stepper.component';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, AppIconsModule, BadgeComponent, StepperComponent, EmptyStateComponent],
  template: `
    <ng-container *ngIf="store.currentProduct() as product; else notFound">
      <div class="page">
        <div
          class="detail-media"
          [style.background]="product.category === 'meat' ? 'linear-gradient(135deg,#F3E4E4,#EAD4D4)' : 'linear-gradient(135deg,#E4F0E9,#D4E8DC)'"
        >
          <span class="detail-emoji">{{ product.emoji }}</span>
          <app-badge *ngIf="product.originalPrice" tone="red">خصم {{ discountPct(product) }}%</app-badge>
        </div>
        <div class="detail-body">
          <h1>{{ product.name }}</h1>
          <div class="detail-price-row">
            <span class="price-now">{{ money(product.price) }}</span>
            <span class="price-old" *ngIf="product.originalPrice">{{ money(product.originalPrice) }}</span>
            <span class="unit-tag">/{{ product.unit }}</span>
          </div>
          <p class="stock-line" [class.in]="product.inStock" [class.out]="!product.inStock">
            {{ product.inStock ? '✅ متوفر الآن' : '⛔ غير متوفر حالياً' }}
          </p>
          <p class="detail-desc">{{ product.desc }}</p>

          <ng-container *ngIf="product.inStock">
            <div class="detail-cart-row" *ngIf="inCartQty() > 0; else addFull">
              <app-stepper [value]="inCartQty()" (valueChange)="store.setQty(product.id, $event)"></app-stepper>
              <button class="btn-primary flex1" (click)="store.go('cart')">عرض السلة</button>
            </div>
            <ng-template #addFull>
              <button class="btn-primary full" (click)="store.addToCart(product)">
                <lucide-angular [img]="Icons.Plus" [size]="18"></lucide-angular> أضف إلى السلة
              </button>
            </ng-template>
          </ng-container>
        </div>
      </div>
    </ng-container>
    <ng-template #notFound>
      <app-empty-state icon="😕" title="المنتج غير موجود" subtitle="">
        <button action class="btn-primary" (click)="store.go('products')">الرجوع للمنتجات</button>
      </app-empty-state>
    </ng-template>
  `,
})
export class ProductDetailPageComponent {
  readonly Icons = Icons;
  readonly money = money;

  constructor(public store: StoreService) {}

  inCartQty(): number {
    const product = this.store.currentProduct();
    if (!product) return 0;
    const found = this.store.cart().find((c) => c.id === product.id);
    return found ? found.qty : 0;
  }

  discountPct(product: { price: number; originalPrice?: number }): number {
    if (!product.originalPrice) return 0;
    return Math.round((1 - product.price / product.originalPrice) * 100);
  }
}
