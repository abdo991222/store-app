import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppIconsModule, Icons } from '../icons';
import { StoreService } from '../services/store.service';
import { ApiService } from '../services/api.service';
import { money } from '../helpers';
import { STATUS_OPTIONS } from '../data';
import { isValidSaudiPhone } from '../helpers';
import { Order } from '../models';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-track-order-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconsModule, EmptyStateComponent],
  template: `
    <div class="page">
      <h1 class="page-title"><lucide-angular [img]="Icons.ClipboardList" [size]="20"></lucide-angular> تتبّع طلبك</h1>
      <p class="muted" style="margin-bottom:14px;">اكتب رقم الجوال اللي عملت بيه الطلب، وهنوريك آخر طلباتك وحالة كل واحد.</p>

      <div class="form-card" style="flex-direction:row; gap:8px; align-items:flex-start; padding:14px;">
        <div style="flex:1;">
          <input
            [(ngModel)]="phone"
            (keydown.enter)="search()"
            placeholder="05xxxxxxxx"
            dir="ltr"
            style="text-align:right; margin-top:0;"
          />
          <span class="field-error" *ngIf="error"><lucide-angular [img]="Icons.AlertCircle" [size]="13"></lucide-angular> {{ error }}</span>
        </div>
        <button class="btn-primary" style="margin-top:0;" (click)="search()" [disabled]="loading">
          <lucide-angular [img]="Icons.Search" [size]="16"></lucide-angular> {{ loading ? 'جاري البحث...' : 'بحث' }}
        </button>
      </div>

      <div *ngIf="searched && !loading" style="margin-top:18px;">
        <app-empty-state *ngIf="results.length === 0" icon="📦" title="مفيش طلبات بالرقم ده" subtitle="تأكد إن الرقم مكتوب زي ما استخدمته وقت الطلب بالظبط"></app-empty-state>

        <div class="orders-table" *ngIf="results.length > 0">
          <div class="order-card" *ngFor="let order of results">
            <div class="order-card-head">
              <span>#{{ order.id.slice(-6) }}</span>
              <span>{{ formatDate(order.date) }}</span>
            </div>
            <span class="status-pill" [style.background]="statusColor(order.status)" style="align-self:flex-start;">
              {{ statusLabel(order.status) }}
            </span>
            <div class="order-items-mini" style="margin-top:6px;">
              <span *ngFor="let it of order.items">{{ it.product.name }} ×{{ it.qty }}</span>
            </div>
            <div class="order-total-mini">الإجمالي: {{ money(order.total) }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TrackOrderPageComponent {
  readonly Icons = Icons;
  readonly money = money;
  private readonly statusOptions = STATUS_OPTIONS;

  phone = '';
  error = '';
  loading = false;
  searched = false;
  results: Order[] = [];

  constructor(public store: StoreService, private api: ApiService) {}

  async search() {
    this.error = '';
    if (!isValidSaudiPhone(this.phone)) {
      this.error = 'رقم جوال سعودي غير صحيح (مثال: 05xxxxxxxx)';
      return;
    }
    this.loading = true;
    this.searched = false;
    try {
      this.results = await this.api.lookupOrdersByPhone(this.phone);
      this.searched = true;
    } catch {
      this.error = 'تعذّر البحث الآن، حاول مرة أخرى';
    } finally {
      this.loading = false;
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('ar-SA');
  }

  statusLabel(status: string): string {
    return this.statusOptions.find((s) => s.id === status)?.label || status;
  }

  statusColor(status: string): string {
    return this.statusOptions.find((s) => s.id === status)?.color || '#6B7280';
  }
}
