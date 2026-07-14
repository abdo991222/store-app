import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppIconsModule, Icons } from '../icons';
import { ViewName, ViewParams } from '../models';

interface NavLink {
  id: 'home' | 'products' | 'track-order' | 'contact';
  label: string;
  icon: any;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconsModule],
  template: `
    <header class="top-navbar">
      <div class="navbar-inner">
        <button class="brand" (click)="go.emit({ v: 'home' })">
          <span class="brand-icon">🌿</span>
          <span class="brand-name">{{ storeName }}</span>
        </button>

        <nav class="nav-links">
          <button
            *ngFor="let link of links"
            class="nav-link-item"
            [class.nav-link-active]="isActive(link.id)"
            (click)="go.emit({ v: link.id })"
          >
            <lucide-angular [img]="link.icon" [size]="18"></lucide-angular>
            <span>{{ link.label }}</span>
          </button>
        </nav>

        <div class="navbar-actions">
          <button class="icon-btn" (click)="searchOpen = !searchOpen" aria-label="بحث">
            <lucide-angular [img]="Icons.Search" [size]="20"></lucide-angular>
          </button>
          <button class="icon-btn cart-btn" (click)="go.emit({ v: 'cart' })" aria-label="السلة">
            <lucide-angular [img]="Icons.ShoppingCart" [size]="20"></lucide-angular>
            <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
          </button>
        </div>
      </div>

      <div class="search-bar" *ngIf="showSearch || searchOpen">
        <lucide-angular [img]="Icons.Search" [size]="18"></lucide-angular>
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          [ngModel]="search"
          (ngModelChange)="searchChange.emit($event)"
        />
        <button *ngIf="search" (click)="searchChange.emit('')">
          <lucide-angular [img]="Icons.X" [size]="16"></lucide-angular>
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Input() storeName = '';
  @Input() view: ViewName = 'home';
  @Input() cartCount = 0;
  @Input() search = '';
  @Input() showSearch = false;

  @Output() go = new EventEmitter<{ v: ViewName; p?: ViewParams }>();
  @Output() searchChange = new EventEmitter<string>();

  readonly Icons = Icons;
  searchOpen = false;

  readonly links: NavLink[] = [
    { id: 'home', label: 'الرئيسية', icon: Icons.Home },
    { id: 'products', label: 'المنتجات', icon: Icons.LayoutGrid },
    { id: 'track-order', label: 'تتبّع الطلب', icon: Icons.ClipboardList },
    { id: 'contact', label: 'تواصل', icon: Icons.Phone },
  ];

  isActive(id: string): boolean {
    if (id === 'products') return this.view === 'products' || this.view === 'category' || this.view === 'product';
    return this.view === id;
  }
}
