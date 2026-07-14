import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <div class="empty-icon">{{ icon }}</div>
      <h3>{{ title }}</h3>
      <p>{{ subtitle }}</p>
      <ng-content select="[action]"></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = '';
  @Input() title = '';
  @Input() subtitle = '';
}
