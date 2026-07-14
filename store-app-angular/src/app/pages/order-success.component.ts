import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { money } from '../helpers';
import { STATUS_OPTIONS } from '../data';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-order-success-page',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  template: `
    <app-empty-state *ngIf="!store.lastOrder(); else successBody" icon="🛒" title="لا يوجد طلب" subtitle="">
      <button action class="btn-primary" (click)="store.go('home')">الرئيسية</button>
    </app-empty-state>

    <ng-template #successBody>
      <div class="page center-page" *ngIf="store.lastOrder() as order">
        <div class="success-icon">✅</div>
        <h1>تم استلام طلبك بنجاح!</h1>
        <p class="muted">رقم الطلب: <strong>#{{ order.id.slice(-6) }}</strong></p>

        <span class="status-pill" [style.background]="statusColor(order.status)">
          {{ statusLabel(order.status) }}
        </span>
        <p class="muted small-note">طلبك الآن <strong>{{ statusLabel(order.status) }}</strong> — هنبعتلك تحديث أول ما الحالة تتغيّر</p>

        <div class="summary-card" style="text-align:right;width:100%;max-width:420px;">
          <div class="summary-row small" *ngFor="let it of order.items">
            <span>{{ it.product.name }} × {{ it.qty }}</span>
            <span>{{ money(it.product.price * it.qty) }}</span>
          </div>
          <div class="summary-row total-row"><span>الإجمالي</span><span>{{ money(order.total) }}</span></div>
        </div>
        <p class="muted small-note">سنتواصل معك قريباً على {{ order.customer.phone }} لتأكيد التوصيل</p>
        <button class="btn-primary" (click)="store.go('home')">العودة للرئيسية</button>
      </div>
    </ng-template>
  `,
})
export class OrderSuccessPageComponent implements OnInit {
  readonly money = money;
  private readonly statusOptions = STATUS_OPTIONS;

  constructor(public store: StoreService) {}

  ngOnInit() {
    // Always show the freshest status (e.g. the admin may have confirmed it since the customer last looked).
    this.store.refreshLastOrder();
  }

  statusLabel(status: string): string {
    return this.statusOptions.find((s) => s.id === status)?.label || status;
  }

  statusColor(status: string): string {
    return this.statusOptions.find((s) => s.id === status)?.color || '#6B7280';
  }
}
