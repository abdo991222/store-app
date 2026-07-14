import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span class="badge badge-{{ tone }}"><ng-content></ng-content></span>`,
})
export class BadgeComponent {
  @Input() tone: 'gold' | 'red' = 'gold';
}
