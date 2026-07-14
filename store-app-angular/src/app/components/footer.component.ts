import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppIconsModule, Icons } from '../icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [AppIconsModule],
  template: `
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="brand-icon">🌿</span>
          <span class="brand-name">{{ storeName }}</span>
        </div>
        <p class="footer-note">طازج يومياً من المزرعة إلى بيتك</p>
        <button class="footer-admin-link" (click)="adminClick.emit()">
          <lucide-angular [img]="Icons.Settings" [size]="14"></lucide-angular> لوحة التحكم
        </button>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  @Input() storeName = '';
  @Output() adminClick = new EventEmitter<void>();
  readonly Icons = Icons;
}
