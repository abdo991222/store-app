import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="message"
      style="position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:#991B1B;color:#fff;padding:10px 14px;font-size:12.5px;z-index:999;direction:rtl;display:flex;align-items:flex-start;gap:8px;font-family:Tajawal,sans-serif;"
    >
      <span style="flex:1;word-break:break-word;">
        <strong>حصل خطأ برمجي (ابعتلي هذا النص بالظبط):</strong><br />{{ message }}
      </span>
      <button (click)="close.emit()" style="background:transparent;color:#fff;border:none;cursor:pointer;font-size:16px;">×</button>
    </div>
  `,
})
export class ErrorBannerComponent {
  @Input() message = '';
  @Output() close = new EventEmitter<void>();
}
