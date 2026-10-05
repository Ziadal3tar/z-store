
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject, finalize, takeUntil } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';
import { UserStateService } from 'src/app/core/state/user-state.service';

interface PersonalData {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  country: string;
  city: string;
  postCode: string;
  street: string;
  house: string;
  building: string;
  entrance: string;
  floor: string;
  apartment: string;
  comment: string;
}

interface PersonalErrors {
  firstName: string;
  lastName: string;
  phone: string;
}

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountProfileComponent implements OnInit, OnDestroy {
  @Input() personal: any;
  @Input() userData: any;

  personalData: PersonalData = this.createEmptyPersonalData();
  initials = 'US';

  errors: PersonalErrors = {
    firstName: '',
    lastName: '',
    phone: '',
  };

  saving = false;
  saveMessage = '';
  saveError = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly userService: UserService,
    private readonly userState: UserStateService,
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.initials = this.buildInitials();
  }

  save(): void {
    this.clearSaveState();
    if (!this.validate()) {
      this.cdr.markForCheck();
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const payload = {
      firstName: this.personalData.firstName,
      lastName: this.personalData.lastName,
      phone: this.personalData.phone,
      DOB: this.personalData.dateOfBirth,
      country: this.personalData.country,
      city: this.personalData.city,
      postCode: this.personalData.postCode,
      street: this.personalData.street,
      house: this.personalData.house,
      building: this.personalData.building,
      entrance: this.personalData.entrance,
      floor: this.personalData.floor,
      apartment: this.personalData.apartment,
      comment: this.personalData.comment,
    };

    this.userService.updateProfile(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: response => {
          this.userState.setUserData(response.user);
          this.userData = response.user;
          this.initials = this.buildInitials();
          this.saveMessage = 'Your profile has been updated.';
        },
        error: error => {
          this.saveError = true;
          this.saveMessage = error?.error?.message || 'Unable to update your profile.';
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearError(field: keyof PersonalErrors): void {
    this.errors[field] = '';
    this.saveMessage = '';
    this.saveError = false;
  }

  private buildInitials(): string {
    const name =
      this.userData?.userName?.trim() || 'User';

    const parts = name
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`
    ).toUpperCase();
  }

  private loadUserData(): void {
    const userName =
      this.userData?.userName?.trim() || '';

    const nameParts = userName
      .split(/\s+/)
      .filter(Boolean);

    this.personalData = {
      firstName: nameParts[0] ?? '',
      lastName: nameParts.slice(1).join(' '),
      phone: this.userData?.phone ?? '',
      dateOfBirth: this.normalizeDate(
        this.userData?.dateOfBirth ??
        this.userData?.birthDate
      ),
      country: this.userData?.country ?? '',
      city: this.userData?.city ?? '',
      postCode: this.userData?.postCode ??
        this.userData?.postalCode ??
        '',
      street: this.userData?.street ?? '',
      house: this.userData?.house ?? '',
      building: this.userData?.building ?? '',
      entrance: this.userData?.entrance ?? '',
      floor: this.userData?.floor ?? '',
      apartment: this.userData?.apartment ?? '',
      comment: this.userData?.comment ?? '',
    };

    this.cdr.markForCheck();
  }

  private validate(): boolean {
    let valid = true;

    if (!this.personalData.firstName.trim()) {
      this.errors.firstName =
        'First name is required.';
      valid = false;
    }

    if (!this.personalData.lastName.trim()) {
      this.errors.lastName =
        'Last name is required.';
      valid = false;
    }

    if (
      this.personalData.phone.trim() &&
      !/^[+\d\s()-]{7,20}$/.test(
        this.personalData.phone.trim()
      )
    ) {
      this.errors.phone =
        'Please enter a valid phone number.';
      valid = false;
    }

    if (!valid) {
      this.saveMessage =
        'Please review the highlighted fields.';
      this.saveError = true;
    }

    return valid;
  }

  private clearSaveState(): void {
    this.saveMessage = '';
    this.saveError = false;

    this.errors = {
      firstName: '',
      lastName: '',
      phone: '',
    };
  }

  private normalizeDate(value: any): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 10);
  }

  private createEmptyPersonalData(): PersonalData {
    return {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      country: '',
      city: '',
      postCode: '',
      street: '',
      house: '',
      building: '',
      entrance: '',
      floor: '',
      apartment: '',
      comment: '',
    };
  }
}

