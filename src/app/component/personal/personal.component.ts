
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';

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
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalComponent implements OnInit {
  @Input() personal: any;
  @Input() userData: any;

  personalData: PersonalData = this.createEmptyPersonalData();

  errors: PersonalErrors = {
    firstName: '',
    lastName: '',
    phone: '',
  };

  saving = false;
  saveMessage = '';
  saveError = false;

  constructor(
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  save(): void {
    this.clearSaveState();

    if (!this.validate()) {
      this.cdr.markForCheck();
      return;
    }

    /*
     * The uploaded component does not currently contain a backend
     * method/API for updating personal information.
     *
     * Keep the form and validation ready without inventing an API.
     */
    this.saving = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.saving = false;
      this.saveError = false;
      this.saveMessage =
        'Your changes are prepared successfully. Connect this action to the profile update API to persist them.';

      this.cdr.markForCheck();
    }, 450);
  }

  clearError(field: keyof PersonalErrors): void {
    this.errors[field] = '';
    this.saveMessage = '';
    this.saveError = false;
  }

  getInitials(): string {
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

