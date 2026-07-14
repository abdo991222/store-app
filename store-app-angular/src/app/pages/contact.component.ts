import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppIconsModule, Icons } from '../icons';
import { StoreService } from '../services/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconsModule, EmptyStateComponent],
  template: `
    <div class="page">
      <h1 class="page-title">تواصل معنا</h1>
      <div class="contact-cards">
        <div class="contact-card"><lucide-angular [img]="Icons.Phone" [size]="20"></lucide-angular><div><strong>اتصل بنا</strong><span>+{{ store.waNumber() }}</span></div></div>
        <div class="contact-card"><lucide-angular [img]="Icons.MapPin" [size]="20"></lucide-angular><div><strong>موقعنا</strong><span>المملكة العربية السعودية</span></div></div>
        <div class="contact-card"><lucide-angular [img]="Icons.Clock" [size]="20"></lucide-angular><div><strong>ساعات العمل</strong><span>يومياً 9 صباحاً - 12 منتصف الليل</span></div></div>
      </div>
      <a class="btn-whatsapp full" [href]="'https://wa.me/' + store.waNumber()" target="_blank" rel="noopener noreferrer">
        <lucide-angular [img]="Icons.MessageCircle" [size]="18"></lucide-angular> راسلنا عبر واتساب
      </a>

      <div class="form-card" style="margin-top:20px">
        <h3 class="summary-title">أرسل لنا رسالة</h3>

        <app-empty-state *ngIf="sent" icon="📩" title="تم إرسال رسالتك" subtitle="شكراً لتواصلك معنا، سنرد عليك قريباً"></app-empty-state>

        <ng-container *ngIf="!sent">
          <label>الاسم</label>
          <input [(ngModel)]="msg.name" placeholder="اسمك" />
          <label>الرسالة</label>
          <textarea rows="3" [(ngModel)]="msg.message" placeholder="اكتب رسالتك هنا"></textarea>
          <button class="btn-primary full" (click)="send()">إرسال</button>
        </ng-container>
      </div>
    </div>
  `,
})
export class ContactPageComponent {
  readonly Icons = Icons;
  msg = { name: '', message: '' };
  sent = false;

  constructor(public store: StoreService) {}

  send() {
    if (this.msg.name && this.msg.message) this.sent = true;
  }
}
