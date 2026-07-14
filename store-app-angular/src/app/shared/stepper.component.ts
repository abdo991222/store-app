import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppIconsModule, Icons } from '../icons';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [AppIconsModule],
  template: `
    <div class="stepper">
      <button type="button" class="stepper-btn" (click)="dec()" aria-label="تقليل الكمية">
        <lucide-angular [img]="Icons.Minus" [size]="16"></lucide-angular>
      </button>
      <span class="stepper-value">{{ value }}</span>
      <button type="button" class="stepper-btn" (click)="inc()" aria-label="زيادة الكمية">
        <lucide-angular [img]="Icons.Plus" [size]="16"></lucide-angular>
      </button>
    </div>
  `,
})
export class StepperComponent {
  @Input() value = 1;
  @Input() min = 1;
  @Input() max = 99;
  @Output() valueChange = new EventEmitter<number>();

  readonly Icons = Icons;

  dec() {
    this.valueChange.emit(Math.max(this.min, this.value - 1));
  }
  inc() {
    this.valueChange.emit(Math.min(this.max, this.value + 1));
  }
}
