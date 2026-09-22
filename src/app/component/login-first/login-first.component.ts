
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-login-first',
  templateUrl: './login-first.component.html',
  styleUrls: ['./login-first.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFirstComponent {
  @Output() closeL = new EventEmitter<boolean>();

  close(): void {
    this.closeL.emit(false);
  }
}

