import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppIconsModule, Icons } from '../icons';
import { StoreService } from '../services/store.service';
import { money, isValidSaudiPhone } from '../helpers';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { CustomerForm } from '../models';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconsModule, EmptyStateComponent],
  template: `
    <app-empty-state *ngIf="items().length === 0; else checkoutBody" icon="🛒" title="السلة فارغة" subtitle="أضف منتجات قبل إتمام الطلب">
      <button action class="btn-primary" (click)="store.go('products')">تصفّح المنتجات</button>
    </app-empty-state>

    <ng-template #checkoutBody>
      <div class="page">
        <h1 class="page-title">إتمام الطلب</h1>

        <div class="form-card">
          <label>الاسم الكامل</label>
          <input [ngModel]="store.checkoutForm().name" (ngModelChange)="updateField('name', $event)" placeholder="مثال: محمد العتيبي" />
          <span class="field-error" *ngIf="errors.name"><lucide-angular [img]="Icons.AlertCircle" [size]="13"></lucide-angular> {{ errors.name }}</span>

          <label>رقم الجوال</label>
          <input [ngModel]="store.checkoutForm().phone" (ngModelChange)="updateField('phone', $event)" placeholder="05xxxxxxxx" dir="ltr" style="text-align:right" />
          <span class="field-error" *ngIf="errors.phone"><lucide-angular [img]="Icons.AlertCircle" [size]="13"></lucide-angular> {{ errors.phone }}</span>

          <label>عنوان التوصيل</label>
          <textarea rows="2" [ngModel]="store.checkoutForm().address" (ngModelChange)="updateField('address', $event)" placeholder="الحي، الشارع، رقم المبنى"></textarea>
          <span class="field-error" *ngIf="errors.address"><lucide-angular [img]="Icons.AlertCircle" [size]="13"></lucide-angular> {{ errors.address }}</span>

          <label>رابط الموقع من خرائط جوجل (اختياري)</label>
          <input [ngModel]="store.checkoutForm().location" (ngModelChange)="updateField('location', $event)" placeholder="https://maps.google.com/..." dir="ltr" style="text-align:right" />

          <label>ملاحظات إضافية (اختياري)</label>
          <textarea rows="2" [ngModel]="store.checkoutForm().notes" (ngModelChange)="updateField('notes', $event)" placeholder="مثال: يُفضل التوصيل مساءً"></textarea>
        </div>

        <div class="summary-card">
          <h3 class="summary-title"><lucide-angular [img]="Icons.ClipboardList" [size]="16"></lucide-angular> ملخص الطلب</h3>
          <div class="summary-row small" *ngFor="let it of items()">
            <span>{{ it.product.name }} × {{ it.qty }}</span>
            <span>{{ money(it.product.price * it.qty) }}</span>
          </div>
          <div class="summary-row total-row"><span>الإجمالي</span><span>{{ money(store.cartTotal()) }}</span></div>

          <p class="order-method-label">اختر طريقة إرسال الطلب:</p>
          <span class="field-error" *ngIf="submitError"><lucide-angular [img]="Icons.AlertCircle" [size]="13"></lucide-angular> {{ submitError }}</span>
          <button class="btn-primary full" (click)="handleWebOrder()" [disabled]="submitting">
            <lucide-angular [img]="Icons.Check" [size]="18"></lucide-angular> 1) تأكيد الطلب مباشرة على الموقع
          </button>
          <div class="or-divider"><span>أو</span></div>
          <button class="btn-whatsapp full" (click)="handleWhatsAppOrder()" [disabled]="submitting">
            <lucide-angular [img]="Icons.MessageCircle" [size]="18"></lucide-angular> 2) إرسال الطلب عبر واتساب
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export class CheckoutPageComponent {
  readonly Icons = Icons;
  readonly money = money;

  // Form values now live in StoreService (store.checkoutForm) so they survive
  // the customer navigating away from checkout and coming back later.
  errors: Partial<Record<keyof CustomerForm, string>> = {};
  submitting = false;
  submitError = '';

  constructor(public store: StoreService) {}

  updateField(key: keyof CustomerForm, value: string) {
    this.store.checkoutForm.update((f) => ({ ...f, [key]: value }));
  }

  items() {
    return this.store.getCartLines();
  }

  private validate(): boolean {
    const form = this.store.checkoutForm();
    const e: Partial<Record<keyof CustomerForm, string>> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'الرجاء إدخال الاسم الكامل';
    if (!isValidSaudiPhone(form.phone)) e.phone = 'رقم جوال سعودي غير صحيح (مثال: 05xxxxxxxx)';
    if (!form.address.trim() || form.address.trim().length < 5) e.address = 'الرجاء إدخال عنوان مفصّل للتوصيل';
    this.errors = e;
    return Object.keys(e).length === 0;
  }

  private buildWhatsAppText(): string {
    const form = this.store.checkoutForm();
    const items = this.items();
    const lines = [
      `*طلب جديد - ${this.store.storeName()}*`,
      '',
      ...items.map((it) => `• ${it.product.name} × ${it.qty} (${it.product.unit}) = ${money(it.product.price * it.qty)}`),
      '',
      `*الإجمالي: ${money(this.store.cartTotal())}*`,
      '',
      `الاسم: ${form.name}`,
      `الجوال: ${form.phone}`,
      `العنوان: ${form.address}`,
      form.location ? `الموقع: ${form.location}` : null,
      form.notes ? `ملاحظات: ${form.notes}` : null,
    ].filter(Boolean);
    return lines.join('\n');
  }

  async handleWebOrder() {
    if (!this.validate() || this.submitting) return;
    this.submitting = true;
    this.submitError = '';
    try {
      await this.store.submitOrder({ customer: this.store.checkoutForm(), method: 'website' });
    } catch (e: any) {
      this.submitError = e?.error?.error || 'تعذّر إرسال الطلب، حاول مرة أخرى';
    } finally {
      this.submitting = false;
    }
  }

  async handleWhatsAppOrder() {
    if (!this.validate() || this.submitting) return;
    this.submitting = true;
    this.submitError = '';
    try {
      // Build the WhatsApp text from the cart BEFORE submitting — submitOrder() clears the form.
      const waText = this.buildWhatsAppText();
      await this.store.submitOrder({ customer: this.store.checkoutForm(), method: 'whatsapp' }, false);
      const url = `https://wa.me/${this.store.waNumber()}?text=${encodeURIComponent(waText)}`;
      window.open(url, '_blank');
      this.store.go('success');
    } catch (e: any) {
      this.submitError = e?.error?.error || 'تعذّر إرسال الطلب، حاول مرة أخرى';
    } finally {
      this.submitting = false;
    }
  }
}
