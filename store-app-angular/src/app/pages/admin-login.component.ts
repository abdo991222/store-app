import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppIconsModule, Icons } from '../icons';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconsModule],
  template: `
    <div class="page center-page">
      <div class="admin-login-card">
        <lucide-angular [img]="Icons.Store" [size]="30"></lucide-angular>
        <h2>لوحة تحكم المتجر</h2>
        <p class="muted">أدخل كلمة المرور للدخول</p>
        <input
          type="password"
          class="admin-pw-input"
          placeholder="كلمة المرور"
          [(ngModel)]="pw"
          (ngModelChange)="err = ''"
          (keydown.enter)="tryLogin()"
          [disabled]="loading"
        />
        <span class="field-error" *ngIf="err"><lucide-angular [img]="Icons.AlertCircle" [size]="13"></lucide-angular> {{ err }}</span>
        <button class="btn-primary full" (click)="tryLogin()" [disabled]="loading">{{ loading ? 'جاري الدخول...' : 'دخول' }}</button>
        <button class="link-btn" (click)="store.go('home')">العودة للمتجر</button>
        <p class="demo-note">كلمة المرور محطوطة في إعدادات السيرفر (.env) — كلّم صاحب المتجر لو نسيتها</p>
      </div>
    </div>
  `,
})
export class AdminLoginPageComponent {
  readonly Icons = Icons;
  pw = '';
  err = '';
  loading = false;

  constructor(public store: StoreService) {}

  async tryLogin() {
    if (!this.pw || this.loading) return;
    this.loading = true;
    this.err = '';
    try {
      await this.store.login(this.pw);
    } catch (e: any) {
      this.err = e?.error?.error || 'كلمة المرور غير صحيحة';
    } finally {
      this.loading = false;
    }
  }
}
