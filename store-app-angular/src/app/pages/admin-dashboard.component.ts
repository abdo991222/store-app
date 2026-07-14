import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppIconsModule, Icons } from '../icons';
import { StoreService } from '../services/store.service';
import { STATUS_OPTIONS } from '../data';
import { money } from '../helpers';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { Order, Product } from '../models';

type AdminTab = 'orders' | 'products' | 'settings';

interface EditableProduct {
  id: string;
  name: string;
  category: string;
  price: string | number;
  originalPrice: string | number;
  unit: string;
  inStock: boolean;
  emoji: string;
  desc: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconsModule, EmptyStateComponent],
  template: `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="admin-brand"><lucide-angular [img]="Icons.Store" [size]="20"></lucide-angular> {{ store.storeName() }}</div>
        <button class="admin-nav-item" [class.active]="tab === 'orders'" (click)="tab = 'orders'">
          <lucide-angular [img]="Icons.ClipboardList" [size]="18"></lucide-angular> الطلبات
        </button>
        <button class="admin-nav-item" [class.active]="tab === 'products'" (click)="tab = 'products'">
          <lucide-angular [img]="Icons.Package" [size]="18"></lucide-angular> المنتجات
        </button>
        <button class="admin-nav-item" [class.active]="tab === 'settings'" (click)="tab = 'settings'">
          <lucide-angular [img]="Icons.Settings" [size]="18"></lucide-angular> الإعدادات
        </button>
        <div class="admin-sidebar-footer">
          <button class="admin-nav-item" (click)="store.go('home')"><lucide-angular [img]="Icons.Store" [size]="18"></lucide-angular> عرض المتجر</button>
          <button class="admin-nav-item" (click)="store.logout()"><lucide-angular [img]="Icons.LogOut" [size]="18"></lucide-angular> تسجيل الخروج</button>
        </div>
      </aside>

      <main class="admin-main">
        <!-- ORDERS TAB -->
        <div *ngIf="tab === 'orders'">
          <h2 class="admin-title">الطلبات ({{ store.orders().length }})</h2>
          <app-empty-state *ngIf="store.orders().length === 0" icon="📦" title="لا توجد طلبات بعد" subtitle="ستظهر هنا الطلبات الجديدة فور وصولها"></app-empty-state>
          <div class="orders-table" *ngIf="store.orders().length > 0">
            <div class="order-card" *ngFor="let o of reversedOrders()">
              <div class="order-card-head">
                <span>#{{ o.id.slice(-6) }}</span>
                <span>{{ formatDate(o.date) }}</span>
              </div>
              <div class="order-card-body">
                <div><lucide-angular [img]="Icons.User" [size]="14"></lucide-angular> {{ o.customer.name }} — {{ o.customer.phone }}</div>
                <div><lucide-angular [img]="Icons.MapPin" [size]="14"></lucide-angular> {{ o.customer.address }}</div>
                <div class="order-items-mini">
                  <span *ngFor="let it of o.items">{{ it.product.name }} ×{{ it.qty }}</span>
                </div>
                <div class="order-total-mini">الإجمالي: {{ money(o.total) }} · ({{ o.method === 'whatsapp' ? 'واتساب' : 'الموقع' }})</div>
              </div>
              <select
                class="status-select"
                [ngModel]="o.status"
                (ngModelChange)="updateOrderStatus(o.id, $event)"
                [style.borderColor]="statusColor(o.status)"
              >
                <option *ngFor="let s of statusOptions" [value]="s.id">{{ s.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- PRODUCTS TAB -->
        <div *ngIf="tab === 'products'">
          <div class="admin-title-row">
            <h2 class="admin-title">المنتجات ({{ store.products().length }})</h2>
            <button class="btn-primary" (click)="openNewProduct()"><lucide-angular [img]="Icons.PlusCircle" [size]="16"></lucide-angular> إضافة منتج</button>
          </div>
          <div class="admin-products-grid">
            <div class="admin-product-row" *ngFor="let p of store.products()">
              <span class="admin-emoji">{{ p.emoji }}</span>
              <div class="admin-product-info">
                <strong>{{ p.name }}</strong>
                <span>{{ money(p.price) }} / {{ p.unit }} {{ p.originalPrice ? '(بدلاً من ' + money(p.originalPrice) + ')' : '' }}</span>
                <span [class]="p.inStock ? 'in-stock-tag' : 'out-stock-tag'">{{ p.inStock ? 'متوفر' : 'غير متوفر' }}</span>
              </div>
              <div class="admin-row-actions">
                <button class="icon-btn" (click)="openEditProduct(p)"><lucide-angular [img]="Icons.Edit2" [size]="16"></lucide-angular></button>
                <button class="icon-btn" (click)="confirmDeleteId = p.id"><lucide-angular [img]="Icons.Trash2" [size]="16" color="#C1440E"></lucide-angular></button>
              </div>
            </div>
          </div>
        </div>

        <!-- SETTINGS TAB -->
        <div class="form-card" style="max-width:480px" *ngIf="tab === 'settings'">
          <h2 class="admin-title">إعدادات المتجر</h2>
          <label>اسم المتجر</label>
          <input [ngModel]="store.storeName()" (ngModelChange)="store.setStoreName($event)" />
          <label>رقم واتساب المتجر (بدون + أو أصفار زائدة، مثال 9665xxxxxxxx)</label>
          <input [ngModel]="store.waNumber()" (ngModelChange)="store.setWaNumber($event)" dir="ltr" style="text-align:right" />
          <p class="demo-note">يتم حفظ الإعدادات تلقائياً</p>
        </div>
      </main>

      <!-- EDIT/NEW PRODUCT MODAL -->
      <div class="modal-overlay" *ngIf="editing" (click)="editing = null">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <h3>{{ editing!.id ? 'تعديل منتج' : 'منتج جديد' }}</h3>
            <button class="icon-btn" (click)="editing = null"><lucide-angular [img]="Icons.X" [size]="18"></lucide-angular></button>
          </div>
          <label>اسم المنتج</label>
          <input [(ngModel)]="editing!.name" />
          <label>التصنيف</label>
          <select [(ngModel)]="editing!.category">
            <option value="meat">اللحوم</option>
            <option value="vegetables">الخضروات</option>
          </select>
          <div class="two-col">
            <div>
              <label>السعر الحالي</label>
              <input type="number" [(ngModel)]="editing!.price" />
            </div>
            <div>
              <label>السعر الأصلي (اختياري - للعروض)</label>
              <input type="number" [(ngModel)]="editing!.originalPrice" />
            </div>
          </div>
          <div class="two-col">
            <div>
              <label>الوحدة</label>
              <input [(ngModel)]="editing!.unit" placeholder="كجم / حبة / كيس" />
            </div>
            <div>
              <label>الرمز (إيموجي)</label>
              <input [(ngModel)]="editing!.emoji" />
            </div>
          </div>
          <label class="checkbox-row">
            <input type="checkbox" [(ngModel)]="editing!.inStock" />
            متوفر في المخزون
          </label>
          <label>الوصف</label>
          <textarea rows="3" [(ngModel)]="editing!.desc"></textarea>
          <button class="btn-primary full" (click)="saveProduct()">حفظ</button>
        </div>
      </div>

      <!-- DELETE CONFIRM MODAL -->
      <div class="modal-overlay" *ngIf="confirmDeleteId" (click)="confirmDeleteId = null">
        <div class="modal-card confirm-card" (click)="$event.stopPropagation()">
          <p class="confirm-text">هل تريد حذف هذا المنتج نهائياً؟</p>
          <div class="confirm-actions">
            <button class="btn-cancel" (click)="confirmDeleteId = null">إلغاء</button>
            <button class="btn-danger" (click)="deleteProduct()">حذف نهائياً</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  readonly Icons = Icons;
  readonly money = money;
  readonly statusOptions = STATUS_OPTIONS;

  tab: AdminTab = 'orders';
  editing: EditableProduct | null = null;
  confirmDeleteId: string | null = null;
  saving = false;

  constructor(public store: StoreService) {}

  ngOnInit() {
    // Orders are fetched right after login, but refresh in case this
    // component is re-entered later in the session.
    this.store.refreshOrders();
  }

  reversedOrders(): Order[] {
    return [...this.store.orders()].reverse();
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('ar-SA');
  }

  statusColor(status: string): string | undefined {
    return this.statusOptions.find((s) => s.id === status)?.color;
  }

  async updateOrderStatus(id: string, status: string) {
    try {
      await this.store.updateOrderStatus(id, status);
    } catch {
      this.store.errorMsg.set('تعذّر تحديث حالة الطلب، حاول مرة أخرى');
    }
  }

  openNewProduct() {
    this.editing = { id: '', name: '', category: 'meat', price: '', originalPrice: '', unit: 'كجم', inStock: true, emoji: '🥩', desc: '' };
  }

  openEditProduct(p: Product) {
    this.editing = { ...p, originalPrice: p.originalPrice ?? '' };
  }

  async saveProduct() {
    const p = this.editing;
    if (!p || !p.name || !p.price || this.saving) return;
    const clean: Partial<Product> = {
      name: p.name,
      category: p.category,
      price: parseFloat(String(p.price)),
      originalPrice: p.originalPrice ? parseFloat(String(p.originalPrice)) : undefined,
      unit: p.unit,
      inStock: p.inStock,
      emoji: p.emoji,
      desc: p.desc,
    };
    this.saving = true;
    try {
      if (p.id) {
        await this.store.updateProduct(p.id, clean);
      } else {
        await this.store.createProduct(clean);
      }
      this.editing = null;
    } catch {
      this.store.errorMsg.set('تعذّر حفظ المنتج، حاول مرة أخرى');
    } finally {
      this.saving = false;
    }
  }

  async deleteProduct() {
    const id = this.confirmDeleteId;
    if (!id) return;
    try {
      await this.store.deleteProduct(id);
    } catch {
      this.store.errorMsg.set('تعذّر حذف المنتج، حاول مرة أخرى');
    } finally {
      this.confirmDeleteId = null;
    }
  }
}
