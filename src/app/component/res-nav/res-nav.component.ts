import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

import { clearAuthToken } from 'src/app/core/auth-token.util';
import { User } from 'src/app/core/models/user.model';
import { UserStateService } from 'src/app/core/state/user-state.service';

@Component({
  selector: 'app-res-nav',
  templateUrl: './res-nav.component.html',
  styleUrls: ['./res-nav.component.css'],
})
export class ResNavComponent implements OnInit, OnDestroy {
  userData: User | undefined;

  @Input() sideNav = 'close';
  @Output() backNav = new EventEmitter<string>();

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly userState: UserStateService,
  ) {}

  ngOnInit(): void {
    this.userState.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.userData = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  back(): void {
    this.sideNav = 'close';
    this.backNav.emit(this.sideNav);
  }

  logout(): void {
    clearAuthToken();
    this.userState.clear();
    this.router.navigate(['/login']);
  }
}
