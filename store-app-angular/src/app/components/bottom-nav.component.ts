import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIconsModule, Icons } from '../icons';
import { ViewName } from '../models';

interface NavItem {
  id: string;
  label: string;
  icon: any;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, AppIconsModule],
  template: `
    <nav class="bottom-nav">
      <button
        *ngFor="let it of items"
        class="nav-item"
        [class.nav-active]="view === it.id"
        (click)="go.emit(it.id)"
      >
        <lucide-angular [img]="it.icon" [size]="20"></lucide-angular>
        <span>{{ it.label }}</span>
      </button>
    </nav>
  `,
})
export class BottomNavComponent {
  @Input() view = '';
  @Output() go = new EventEmitter<string>();

  readonly items: NavItem[] = [
    { id: 'home', label: 'الرئيسية', icon: Icons.Home },
    { id: 'products', label: 'المنتجات', icon: Icons.LayoutGrid },
    { id: 'cart', label: 'السلة', icon: Icons.ShoppingCart },
    { id: 'contact', label: 'تواصل', icon: Icons.Phone },
  ];
}
