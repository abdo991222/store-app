import { Component, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from './services/store.service';
import { CATEGORIES } from './data';

import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';
import { WhatsAppFloatComponent } from './components/whatsapp-float.component';
import { ToastComponent } from './shared/toast.component';
import { ErrorBannerComponent } from './shared/error-banner.component';

import { HomePageComponent } from './pages/home.component';
import { ProductsPageComponent } from './pages/products.component';
import { ProductDetailPageComponent } from './pages/product-detail.component';
import { CartPageComponent } from './pages/cart.component';
import { CheckoutPageComponent } from './pages/checkout.component';
import { OrderSuccessPageComponent } from './pages/order-success.component';
import { TrackOrderPageComponent } from './pages/track-order.component';
import { ContactPageComponent } from './pages/contact.component';
import { AdminLoginPageComponent } from './pages/admin-login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent, FooterComponent, WhatsAppFloatComponent, ToastComponent, ErrorBannerComponent,
    HomePageComponent, ProductsPageComponent, ProductDetailPageComponent, CartPageComponent,
    CheckoutPageComponent, OrderSuccessPageComponent, TrackOrderPageComponent, ContactPageComponent,
    AdminLoginPageComponent, AdminDashboardComponent,
  ],
  template: `
    <div class="loading-screen" *ngIf="!store.ready()">
      <span class="loading-emoji">🥦</span>
      <span>جاري التحميل...</span>
    </div>

    <ng-container *ngIf="store.ready()">
      <!-- ADMIN LOGIN (fully standalone page) -->
      <div dir="rtl" class="admin-page-root" *ngIf="store.view() === 'admin-login'">
        <app-error-banner [message]="store.errorMsg()" (close)="store.errorMsg.set('')"></app-error-banner>
        <app-admin-login-page></app-admin-login-page>
      </div>

      <!-- ADMIN DASHBOARD (fully standalone page) -->
      <div dir="rtl" class="admin-page-root" *ngIf="store.view() === 'admin' && store.isAdmin()">
        <app-error-banner [message]="store.errorMsg()" (close)="store.errorMsg.set('')"></app-error-banner>
        <app-admin-dashboard></app-admin-dashboard>
      </div>

      <!-- MAIN STORE (full-width, top navbar) -->
      <div dir="rtl" class="store-root" *ngIf="showStoreShell()">
        <app-error-banner [message]="store.errorMsg()" (close)="store.errorMsg.set('')"></app-error-banner>
        <app-header
          [storeName]="store.storeName()"
          [view]="store.view()"
          [cartCount]="store.cartCount()"
          [search]="store.search()"
          [showSearch]="showSearch()"
          (go)="store.go($event.v, $event.p)"
          (searchChange)="store.search.set($event)"
        ></app-header>

        <main class="store-main">
          <app-home-page *ngIf="store.view() === 'home'"></app-home-page>

          <app-products-page
            *ngIf="store.view() === 'products'"
            title="كل المنتجات"
          ></app-products-page>

          <app-products-page
            *ngIf="store.view() === 'category'"
            [fixedCategory]="store.params().category || 'all'"
            [title]="categoryTitle()"
          ></app-products-page>

          <app-product-detail-page *ngIf="store.view() === 'product'"></app-product-detail-page>

          <app-cart-page *ngIf="store.view() === 'cart'"></app-cart-page>

          <app-checkout-page *ngIf="store.view() === 'checkout'"></app-checkout-page>

          <app-order-success-page *ngIf="store.view() === 'success'"></app-order-success-page>

          <app-track-order-page *ngIf="store.view() === 'track-order'"></app-track-order-page>

          <app-contact-page *ngIf="store.view() === 'contact'"></app-contact-page>
        </main>

        <app-footer
          [storeName]="store.storeName()"
          (adminClick)="store.go(store.isAdmin() ? 'admin' : 'admin-login')"
        ></app-footer>

        <app-toast [show]="store.toast().show" [message]="store.toast().message"></app-toast>
        <app-whatsapp-float *ngIf="store.view() !== 'checkout'" [waNumber]="store.waNumber()"></app-whatsapp-float>
      </div>
    </ng-container>
  `,
})
export class AppComponent implements OnDestroy {
  constructor(public store: StoreService) {
    window.addEventListener('error', this.onWindowError);
    window.addEventListener('unhandledrejection', this.onUnhandledRejection);

    // Mirrors the React version's: `if (view === "admin" && !isAdmin) { go("admin-login"); return null; }`
    effect(() => {
      if (this.store.view() === 'admin' && !this.store.isAdmin()) {
        this.store.go('admin-login');
      }
    });
  }

  private onWindowError = (e: ErrorEvent) => {
    this.store.errorMsg.set(e?.error?.message || e?.message || 'خطأ غير معروف');
  };

  private onUnhandledRejection = (e: PromiseRejectionEvent) => {
    this.store.errorMsg.set('Promise error: ' + (e?.reason?.message || String(e?.reason)));
  };

  ngOnDestroy() {
    window.removeEventListener('error', this.onWindowError);
    window.removeEventListener('unhandledrejection', this.onUnhandledRejection);
  }

  showStoreShell(): boolean {
    const v = this.store.view();
    return v !== 'admin-login' && !(v === 'admin' && this.store.isAdmin());
  }

  showSearch(): boolean {
    const v = this.store.view();
    return v === 'products' || v === 'category';
  }

  categoryTitle(): string {
    const category = this.store.params().category;
    const found = CATEGORIES.find((c) => c.id === category);
    if (found) return found.name;
    return category === 'offers' ? 'العروض' : 'المنتجات';
  }
}
