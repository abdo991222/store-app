import { Component, Input } from '@angular/core';
import { AppIconsModule, Icons } from '../icons';

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  imports: [AppIconsModule],
  template: `
    <a
      class="wa-float"
      [href]="href()"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
    >
      <lucide-angular [img]="Icons.MessageCircle" [size]="26"></lucide-angular>
    </a>
  `,
})
export class WhatsAppFloatComponent {
  @Input() waNumber = '';
  readonly Icons = Icons;

  href(): string {
    return `https://wa.me/${this.waNumber}?text=${encodeURIComponent('مرحباً، أرغب بالاستفسار عن منتجاتكم')}`;
  }
}
