import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ContactService } from 'src/app/core/services/contact.service';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPageComponent implements OnDestroy {
  readonly senderForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(30)] }),
    subject: new FormControl('Order question', { nonNullable: true, validators: [Validators.required] }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(1500)] }),
  });

  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  readonly topics = [
    'Order question',
    'Product question',
    'Delivery',
    'Returns',
    'Account',
    'Other',
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly contactService: ContactService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  get control() {
    return this.senderForm.controls;
  }

  send(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.senderForm.invalid || this.loading) {
      this.senderForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.contactService.sendMessage(this.senderForm.getRawValue())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Your message has been sent successfully.';
          this.senderForm.reset({
            name: '',
            email: '',
            phone: '',
            subject: 'Order question',
            message: '',
          });
          this.submitted = false;
          this.cdr.markForCheck();
        },
        error: error => {
          this.errorMessage = error?.error?.message || 'Unable to send your message right now. Please try again.';
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
