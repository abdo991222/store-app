import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { FILTERS } from '../data';
import { ProductCardComponent } from '../components/product-card.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { Product } from '../models';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, EmptyStateComponent],
  template: `
    <div class="page">
      <h1 class="page-title">{{ title || 'كل المنتجات' }}</h1>
      <div class="filter-row">
        <button
          *ngFor="let f of filters"
          class="filter-chip"
          [class.filter-active]="currentCategory() === f.id"
          (click)="setActiveCategory(f.id)"
        >
          {{ f.label }}
        </button>
      </div>

      <app-empty-state *ngIf="filtered().length === 0" icon="🔍" title="لا توجد نتائج" subtitle="جرّب كلمة بحث أخرى أو اختر تصنيفاً مختلفاً"></app-empty-state>

      <div class="product-grid" *ngIf="filtered().length > 0">
        <app-product-card
          *ngFor="let p of filtered()"
          [product]="p"
          [cartQty]="store.cartMap()[p.id] || 0"
          (open)="openProduct($event)"
          (add)="store.addToCart($event)"
          (qtyChange)="store.setQty($event.id, $event.qty)"
        ></app-product-card>
      </div>
    </div>
  `,
})
export class ProductsPageComponent {
  /** Fixed category (used by the "category" view, driven by route params). Leave undefined for the "all products" view. */
  @Input() fixedCategory: string | undefined = undefined;
  @Input() title = '';

  readonly filters = FILTERS;

  constructor(public store: StoreService) {}

  currentCategory(): string {
    return this.fixedCategory ?? this.store.activeCategory();
  }

  filtered(): Product[] {
    const search = this.store.search().toLowerCase();
    const activeCategory = this.currentCategory();
    return this.store.products().filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search);
      const matchCat =
        activeCategory === 'all'
          ? true
          : activeCategory === 'offers'
          ? !!p.originalPrice
          : p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }

  setActiveCategory(id: string) {
    if (this.fixedCategory !== undefined) {
      this.store.go('category', { category: id });
    } else {
      this.store.activeCategory.set(id);
    }
  }

  openProduct(p: Product) {
    this.store.go('product', { id: p.id });
  }
}
