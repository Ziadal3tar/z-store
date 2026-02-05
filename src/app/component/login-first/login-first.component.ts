import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-login-first',
  templateUrl: './login-first.component.html',
  styleUrls: ['./login-first.component.css']
})
export class LoginFirstComponent {
  @Output() closeL: EventEmitter<any> = new EventEmitter<any>();
  close() {
    this.closeL.emit(false);
  }
}
