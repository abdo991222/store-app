import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIconsModule, Icons } from '../icons';
import { StoreService } from '../services/store.service';
import { CATEGORIES } from '../data';
import { ProductCardComponent } from '../components/product-card.component';
import { Product } from '../models';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, AppIconsModule, ProductCardComponent],
  template: `
    <div class="page">
      <section class="hero">
        <div class="hero-text">
          <span class="hero-eyebrow">طازج يومياً من المزرعة إلى بيتك</span>
          <h1>لحوم وخضروات طازجة بجودة تثق بها</h1>
          <p>توصيل سريع لجميع أحياء المدينة، وطلب فوري عبر واتساب</p>
          <button class="btn-primary" (click)="store.go('products')">
            تسوّق الآن <lucide-angular [img]="Icons.ChevronLeft" [size]="18"></lucide-angular>
          </button>
        </div>
        <div class="hero-art">🥩🥦</div>
      </section>

      <section class="cat-row">
        <button
          *ngFor="let c of categories"
          class="cat-chip"
          [style.background]="c.grad"
          (click)="store.go('category', { category: c.id })"
        >
          <span class="cat-emoji">{{ c.icon }}</span>
          <span>{{ c.name }}</span>
        </button>
        <button class="cat-chip cat-chip-gold" (click)="store.go('category', { category: 'offers' })">
          <span class="cat-emoji">🏷️</span>
          <span>العروض</span>
        </button>
      </section>

      <section class="section" *ngIf="offers().length > 0">
        <div class="section-head">
          <h2><lucide-angular [img]="Icons.Tag" [size]="18"></lucide-angular> عروض اليوم</h2>
          <button (click)="store.go('category', { category: 'offers' })">عرض الكل</button>
        </div>
        <div class="product-grid">
          <app-product-card
            *ngFor="let p of offers()"
            [product]="p"
            [cartQty]="store.cartMap()[p.id] || 0"
            (open)="openProduct($event)"
            (add)="store.addToCart($event)"
            (qtyChange)="store.setQty($event.id, $event.qty)"
          ></app-product-card>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>🥩 اللحوم الطازجة</h2>
          <button (click)="store.go('category', { category: 'meat' })">عرض الكل</button>
        </div>
        <div class="product-grid">
          <app-product-card
            *ngFor="let p of meat()"
            [product]="p"
            [cartQty]="store.cartMap()[p.id] || 0"
            (open)="openProduct($event)"
            (add)="store.addToCart($event)"
            (qtyChange)="store.setQty($event.id, $event.qty)"
          ></app-product-card>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>🥦 الخضروات الطازجة</h2>
          <button (click)="store.go('category', { category: 'vegetables' })">عرض الكل</button>
        </div>
        <div class="product-grid">
          <app-product-card
            *ngFor="let p of veg()"
            [product]="p"
            [cartQty]="store.cartMap()[p.id] || 0"
            (open)="openProduct($event)"
            (add)="store.addToCart($event)"
            (qtyChange)="store.setQty($event.id, $event.qty)"
          ></app-product-card>
        </div>
      </section>
    </div>
  `,
})
export class HomePageComponent {
  readonly Icons = Icons;
  readonly categories = CATEGORIES;

  constructor(public store: StoreService) {}

  offers = () => this.store.products().filter((p) => p.originalPrice);
  meat = () => this.store.products().filter((p) => p.category === 'meat').slice(0, 4);
  veg = () => this.store.products().filter((p) => p.category === 'vegetables').slice(0, 4);

  openProduct(p: Product) {
    this.store.go('product', { id: p.id });
  }
}
