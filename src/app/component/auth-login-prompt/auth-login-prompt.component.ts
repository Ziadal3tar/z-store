
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-auth-login-prompt',
  templateUrl: './auth-login-prompt.component.html',
  styleUrls: ['./auth-login-prompt.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLoginPromptComponent {
  @Output() closeL = new EventEmitter<boolean>();

  close(): void {
    this.closeL.emit(false);
  }
}

