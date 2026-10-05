import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';

import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs';

import { UserService } from 'src/app/core/services/user.service';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { AdminStateService } from 'src/app/core/state/admin-state.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent
  implements OnInit, OnDestroy
{
  @Input() allData: any;

  name = '';

  allUser: any[] = [];
  allAdmins: any[] = [];
  readonly itemsPerPage = 8;
  userPage = 1;
  adminPage = 1;

  userData: any;

  messageErr = '';

  loaded = 'd-none';
  loading = 'd-none';

  confirmRemoveUser = false;
  deletedUserId: any;

  activeMenuId: string | null = null;

  private readonly destroy$ =
    new Subject<void>();

  private readonly search$ =
    new Subject<string>();

  constructor(
    private readonly userService: UserService,
    private readonly userState: UserStateService,
    private readonly adminState: AdminStateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userState.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.userData = data;
        this.cdr.markForCheck();
      });

    this.adminState.admins$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        this.adminPage = Math.min(this.adminPage, this.adminTotalPages);
        this.allAdmins = Array.isArray(data) ? data.map((item: any) => ({ ...item, displayInitials: this.buildInitials(item.adminId?.userName) })) : [];

        this.cdr.markForCheck();
      });

    this.search$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.performSearch(value);
      });

    this.adminState.refreshAdmins();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.search$.complete();
  }

  onSearchChange(
    value: string
  ): void {
    this.name =
      value.trimStart();

    this.activeMenuId = null;

    this.search$.next(
      this.name
    );
  }

  clearSearch(): void {
    this.name = '';
    this.allUser = [];
    this.userPage = 1;
    this.messageErr = '';
    this.loaded = 'd-none';
    this.activeMenuId = null;

    this.cdr.markForCheck();
  }

  private performSearch(
    value: string
  ): void {
    const searchName =
      value.trim();

    this.messageErr = '';
    this.activeMenuId = null;

    if (!searchName) {
      this.allUser = [];
      this.loaded = 'd-none';

      this.cdr.markForCheck();
      return;
    }

    this.loaded = '';
    this.cdr.markForCheck();

    this.userService
      .searchUser({
        name: searchName,
      })
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any) => {
          this.userPage = 1;
          this.allUser = Array.isArray(data?.allUser) ? data.allUser.map((item: any) => ({ ...item, displayInitials: this.buildInitials(item.userName) })) : [];

          this.loaded = 'd-none';

          if (
            data?.message &&
            data.message !== 'users'
          ) {
            this.messageErr =
              data.message;
          } else {
            this.messageErr = '';
          }

          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'User search failed:',
            error
          );

          this.allUser = [];
          this.loaded = 'd-none';
          this.messageErr =
            'Unable to search users right now.';

          this.cdr.markForCheck();
        },
      });
  }

  addAdmin(id: any): void {
    if (!id) {
      return;
    }

    this.loading = '';
    this.activeMenuId = null;
    this.cdr.markForCheck();

    this.userService
      .addAdmin(id)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any) => {
          if (
            data?.message === 'added'
          ) {
            this.adminState.refreshAdmins();
            this.performSearch(
              this.name
            );
          }

          this.loading = 'd-none';
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Add admin failed:',
            error
          );

          this.loading = 'd-none';
          this.cdr.markForCheck();
        },
      });
  }

  block(id: any): void {
    if (!id) {
      return;
    }

    this.loading = '';
    this.activeMenuId = null;
    this.cdr.markForCheck();

    this.userService
      .block(id)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any) => {
          if (
            data?.message === 'Done'
          ) {
            this.performSearch(
              this.name
            );

            this.adminState.refreshAdmins();
          }

          this.loading = 'd-none';
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Block/unblock failed:',
            error
          );

          this.loading = 'd-none';
          this.cdr.markForCheck();
        },
      });
  }

  openRemoveUser(id: any): void {
    if (!id) {
      return;
    }

    this.deletedUserId = id;
    this.confirmRemoveUser = true;
    this.activeMenuId = null;

    this.cdr.markForCheck();
  }

  closeRemoveUser(): void {
    this.confirmRemoveUser = false;
    this.deletedUserId = null;

    this.cdr.markForCheck();
  }

  removeUser(id: any): void {
    if (!id) {
      return;
    }

    this.loading = '';
    this.cdr.markForCheck();

    this.userService
      .deleteUser(id)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.confirmRemoveUser = false;
          this.deletedUserId = null;

          this.loading = 'd-none';

          this.allUser =
            this.allUser.filter(
              (user) =>
                user?._id !== id
            );

          this.adminState.refreshAdmins();

          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Delete user failed:',
            error
          );

          this.loading = 'd-none';
          this.cdr.markForCheck();
        },
      });
  }

  removeAdmin(id: any): void {
    if (!id) {
      return;
    }

    this.loading = '';
    this.activeMenuId = null;
    this.cdr.markForCheck();

    this.userService
      .addAdmin(id)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any) => {
          if (
            data?.message === 'removed'
          ) {
            this.adminState.refreshAdmins();
            this.performSearch(
              this.name
            );
          }

          this.loading = 'd-none';
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Remove admin failed:',
            error
          );

          this.loading = 'd-none';
          this.cdr.markForCheck();
        },
      });
  }

  toggleMenu(
    id: any,
    event: Event
  ): void {
    event.stopPropagation();

    const menuId = String(id);

    this.activeMenuId =
      this.activeMenuId === menuId
        ? null
        : menuId;

    this.cdr.markForCheck();
  }

  get userTotalPages(): number {
    return Math.max(1, Math.ceil(this.allUser.length / this.itemsPerPage));
  }

  get adminTotalPages(): number {
    return Math.max(1, Math.ceil(this.allAdmins.length / this.itemsPerPage));
  }

  get paginatedUsers(): any[] {
    const start = (this.userPage - 1) * this.itemsPerPage;
    return this.allUser.slice(start, start + this.itemsPerPage);
  }

  get paginatedAdmins(): any[] {
    const start = (this.adminPage - 1) * this.itemsPerPage;
    return this.allAdmins.slice(start, start + this.itemsPerPage);
  }

  get userPageNumbers(): number[] {
    return Array.from({ length: this.userTotalPages }, (_, index) => index + 1);
  }

  get adminPageNumbers(): number[] {
    return Array.from({ length: this.adminTotalPages }, (_, index) => index + 1);
  }

  goToUserPage(page: number): void {
    this.userPage = Math.min(Math.max(page, 1), this.userTotalPages);
    this.cdr.markForCheck();
  }

  goToAdminPage(page: number): void {
    this.adminPage = Math.min(Math.max(page, 1), this.adminTotalPages);
    this.cdr.markForCheck();
  }

  trackByUserId(
    index: number,
    item: any
  ): string | number {
    return item?._id ?? index;
  }

  trackByAdminId(
    index: number,
    item: any
  ): string | number {
    return (
      item?._id ??
      item?.adminId?._id ??
      index
    );
  }

  private buildInitials(
    userName?: string
  ): string {
    if (!userName) {
      return '?';
    }

    const parts = userName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }
}
