import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
})
export class CheckboxComponent {
  uid: string = Math.random().toString(36).substring(2, 9);

  @Input() label: string = '';

  @Input() hint?: string;

  @Input() name: string = '';

  @Input() checked: boolean = false;

  @Input() disabled: boolean = false;

  onChange(event: any) {
    this.checked = event.target.checked;
  }
}
