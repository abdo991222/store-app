import { Component, Input } from '@angular/core';
import { AppIconsModule, Icons } from '../icons';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [AppIconsModule],
  template: `
    <div class="toast" [class.toast-show]="show">
      <lucide-angular [img]="Icons.Check" [size]="16"></lucide-angular>
      <span>{{ message }}</span>
    </div>
  `,
})
export class ToastComponent {
  @Input() show = false;
  @Input() message = '';
  readonly Icons = Icons;
}
