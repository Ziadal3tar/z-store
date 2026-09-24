import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  senderForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.maxLength(30)]),
    subject: new FormControl('Order question', [Validators.required]),
    message: new FormControl('', [Validators.required, Validators.maxLength(1500)]),
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

  // constructor(private readonly commonService: CommonService) {}

  get control() {
    return this.senderForm.controls;
  }

  // send(): void {
  //   this.errorMessage = '';
  //   this.successMessage = '';
  //   this.submitted = true;

  //   if (this.senderForm.invalid || this.loading) {
  //     this.senderForm.markAllAsTouched();
  //     return;
  //   }

  //   const value = this.senderForm.getRawValue();

  //   const data = {
  //     name: value.name?.trim() || '',
  //     email: value.email?.trim() || '',
  //     message: [
  //       `Subject: ${value.subject || 'General enquiry'}`,
  //       value.phone ? `Phone: ${value.phone}` : '',
  //       '',
  //       value.message?.trim() || '',
  //     ].filter(Boolean).join('\n'),
  //   };

  //   this.loading = true;

  //   this.commonService.sendEmail(data).subscribe({
  //     next: (response: any) => {
  //       if (response?.message === 'sended') {
  //         this.successMessage = 'Your message has been sent successfully.';
  //         this.senderForm.reset({
  //           name: '',
  //           email: '',
  //           phone: '',
  //           subject: 'Order question',
  //           message: '',
  //         });
  //         this.submitted = false;
  //       } else {
  //         this.errorMessage = response?.message || 'Unable to send your message right now.';
  //       }

  //       this.loading = false;
  //     },
  //     error: (error: any) => {
  //       this.errorMessage =
  //         error?.error?.message || 'Unable to send your message right now. Please try again.';
  //       this.loading = false;
  //     },
  //   });
  // }
}
