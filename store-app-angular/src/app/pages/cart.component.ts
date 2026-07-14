import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIconsModule, Icons } from '../icons';
import { StoreService } from '../services/store.service';
import { money } from '../helpers';
import { StepperComponent } from '../shared/stepper.component';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, AppIconsModule, StepperComponent, EmptyStateComponent],
  template: `
    <app-empty-state *ngIf="items().length === 0; else cartBody" icon="🛒" title="سلتك فارغة" subtitle="أضف بعض المنتجات الطازجة لتبدأ طلبك">
      <button action class="btn-primary" (click)="store.go('products')">تصفّح المنتجات</button>
    </app-empty-state>

    <ng-template #cartBody>
      <div class="page">
        <h1 class="page-title">سلة المشتريات</h1>
        <div class="cart-list">
          <div class="cart-row" *ngFor="let it of items()">
            <div class="cart-emoji">{{ it.product.emoji }}</div>
            <div class="cart-info">
              <span class="cart-name">{{ it.product.name }}</span>
              <span class="cart-unit-price">{{ money(it.product.price) }} / {{ it.product.unit }}</span>
              <app-stepper [value]="it.qty" (valueChange)="store.setQty(it.id, $event)"></app-stepper>
            </div>
            <div class="cart-right">
              <span class="cart-subtotal">{{ money(it.product.price * it.qty) }}</span>
              <button class="icon-btn" (click)="store.removeItem(it.id)" aria-label="حذف">
                <lucide-angular [img]="Icons.Trash2" [size]="18" color="#C1440E"></lucide-angular>
              </button>
            </div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-row"><span>الإجمالي</span><span>{{ money(store.cartTotal()) }}</span></div>
          <div class="summary-row summary-note"><span>رسوم التوصيل تُحدد عند التأكيد</span></div>
          <button class="btn-primary full" (click)="store.go('checkout')">
            إتمام الطلب <lucide-angular [img]="Icons.ChevronLeft" [size]="18"></lucide-angular>
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export class CartPageComponent {
  readonly Icons = Icons;
  readonly money = money;

  constructor(public store: StoreService) {}

  items() {
    return this.store.getCartLines();
  }
}
