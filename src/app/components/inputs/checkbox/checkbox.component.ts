import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
})
export class CheckboxComponent {
  uid: string = Math.random().toString(36).substring(2, 9);

  @Input() model = new FormControl(false);

  @Input() label: string = '';

  @Input() hint?: string;

  @Input() name: string = '';

  @Input() disabled: boolean = false;
}
