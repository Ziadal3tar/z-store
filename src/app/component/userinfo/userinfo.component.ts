
import { Component, OnDestroy } from '@angular/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { UserStateService } from 'src/app/core/state/user-state.service';
import { UserService } from '../../services/user.service';
import { StoresService } from './../../services/stores.service';

type AccountSection =
  | 'orders'
  | 'favorites'
  | 'personal'
  | 'settings';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserinfoComponent implements OnDestroy {
  activeSection: AccountSection = 'settings';

  userData: any = null;

  storDetails = false;

  image: File | null = null;
  storeName = '';
  storeCategory = '';

  storeTitle = '';
  removeTitle = '';

  url = '';
  updatedImg: File | null = null;

  errMessage = '';

  favcount = 0;
  ordersCount = 0;

  loading = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly userStateService: UserStateService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly userService: UserService,
    private readonly storesService: StoresService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userStateService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.userData = data;

        this.url = this.getProfileImage(data?.profilePic);

        this.favcount = data?.wishlist?.length ?? 0;

        this.storeBtnTitle();

        this.cdr.markForCheck();
      });

    this.userStateService.refresh();
    this.resolveInitialSection();
  }

  selectSection(section: AccountSection): void {
    this.activeSection = section;

    /*
     * Keep the scroll position useful on mobile after changing tabs.
     */
    if (window.innerWidth <= 850) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }

    this.cdr.markForCheck();
  }

  upload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.errMessage = 'Please select a valid image.';
      this.cdr.markForCheck();
      return;
    }

    this.image = file;
    this.errMessage = '';

    this.cdr.markForCheck();
  }

  addStore(): void {
    this.errMessage = '';

    if (!this.image) {
      this.errMessage = 'Please select a store image.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.storeName.trim()) {
      this.errMessage = 'Please enter a store name.';
      this.cdr.markForCheck();
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const formdata = new FormData();

    formdata.append('image', this.image);
    formdata.append('name', this.storeName.trim());

    this.storesService
      .addStores(formdata)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any) => {
          if (data?.message === 'added') {
            this.userStateService.setUserData(
              data.updateUser ?? {
                ...this.userData,
                storeId: data.newStore?._id,
              }
            );

            this.storeTitle = 'Open Your Store';
            this.removeTitle = 'delete-store';
            this.storDetails = false;

            this.router.navigate([
              `/store/${data.newStore?._id}/admin`,
            ]);

            this.resetStoreForm();

            return;
          }

          if (data?.err) {
            this.errMessage =
              data.errMessage ??
              'You cannot own a store while you are an Admin.';

            return;
          }

          this.errMessage =
            data?.message ??
            'Unexpected response from server.';
        },

        error: (err: HttpErrorResponse) => {
          this.errMessage =
            err.error?.message ??
            'Failed to add store. Try again later.';
        },
      });
  }

  storeBtn(): void {
    if (!this.userData) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.userData.storeId) {
      this.storDetails = !this.storDetails;
      this.errMessage = '';
      this.cdr.markForCheck();
      return;
    }

    const storeId =
      this.userData.storeId?._id ??
      this.userData.storeId;

    if (!storeId) {
      this.userStateService.refresh();
      return;
    }

    this.storDetails = false;

    this.router.navigate([
      `/store/${storeId}`,
    ]);
  }

  storeBtnTitle(): void {
    if (!this.userData) {
      this.storeTitle = 'Add your store';
      this.removeTitle = '';
      return;
    }

    if (!this.userData.storeId) {
      this.storeTitle = 'Add your store';
      this.removeTitle = '';
    } else {
      this.storeTitle = 'Open Your Store';
      this.removeTitle = 'deleteStore';
    }
  }

  deleteStore(): void {
    if (!this.userData?._id) {
      return;
    }

    const storeId =
      this.userData.storeId?._id ??
      this.userData.storeId;

    if (!storeId) {
      this.userStateService.refresh();
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete your store? This action cannot be undone.'
    );

    if (!confirmed || this.loading) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.storesService
      .deleteStore(storeId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any) => {
          if (data?.message === 'removed') {
            this.userStateService.setUserData({
              ...this.userData,
              storeId: null,
            });

            this.storeTitle = 'Add your store';
            this.removeTitle = '';
            return;
          }

          this.errMessage =
            data?.message ??
            'Unable to delete your store.';
        },

        error: (err: HttpErrorResponse) => {
          this.errMessage =
            err.error?.message ??
            'Failed to delete store. Try again later.';
        },
      });
  }

  updateUserImg(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      return;
    }

    this.updatedImg = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.url = String(reader.result ?? this.url);
      this.cdr.markForCheck();
    };

    reader.readAsDataURL(file);

    this.cdr.markForCheck();
  }

  save(): void {
    if (!this.updatedImg) {
      return;
    }

    if (!this.userData?._id) {
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const formdata = new FormData();

    formdata.append('image', this.updatedImg);
    formdata.append('id', this.userData._id);

    this.userService
      .editProfilePic(formdata)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any) => {
          if (
            data?.message === 'created' ||
            data?.message === 'Done'
          ) {
            if (data?.updatedUser) {
              this.userStateService.setUserData(
                data.updatedUser
              );
            } else {
              this.userStateService.refresh();
            }

            this.updatedImg = null;

            return;
          }

          this.errMessage =
            data?.message ??
            'Unable to update profile picture.';
        },

        error: (err: HttpErrorResponse) => {
          this.errMessage =
            err.error?.message ??
            'Failed to update profile picture.';
        },
      });
  }

  cancel(): void {
    this.url = this.getProfileImage(
      this.userData?.profilePic
    );

    this.updatedImg = null;

    this.cdr.markForCheck();
  }

  private getProfileImage(profilePic: any): string {
    if (Array.isArray(profilePic)) {
      return profilePic[0] ?? '';
    }

    return profilePic ?? '';
  }

  private resolveInitialSection(): void {
    const querySection =
      this.activatedRoute.snapshot.queryParamMap.get(
        'section'
      );

    const allowedSections: AccountSection[] = [
      'orders',
      'favorites',
      'personal',
      'settings',
    ];

    if (
      querySection &&
      allowedSections.includes(
        querySection as AccountSection
      )
    ) {
      this.activeSection =
        querySection as AccountSection;
    }
  }

  private resetStoreForm(): void {
    this.image = null;
    this.storeName = '';
    this.storeCategory = '';
    this.errMessage = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

