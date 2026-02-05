import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { StoresService } from 'src/app/services/stores.service';

@Component({

    selector: 'app-create-your-store',
  templateUrl: './create-your-store.component.html',
  styleUrls: ['./create-your-store.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateYourStoreComponent implements OnDestroy {
  form: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;
  imageFile: File | null = null;
  loading = false;
  error = '';
  private subs: Subscription[] = [];

  // قيود بسيطة للصورة
  readonly MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
  readonly ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

  constructor(
    private fb: FormBuilder,
    private storesSvc: StoresService,
    private router: Router,
    private shared: SharedService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      description: ['', [Validators.maxLength(1000)]],
    });
  }
openHome(): void {
  this.router.navigate(['/']);
}
  onFileChange(event: Event): void {
    this.error = '';
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) {
      this.imageFile = null;
      this.previewUrl = null;
      this.cdr.markForCheck();
      return;
    }

    if (!this.ACCEPTED_TYPES.includes(file.type)) {
      this.error = 'Please upload an image (png, jpg, webp).';
      this.cdr.markForCheck();
      return;
    }

    if (file.size > this.MAX_IMAGE_SIZE_BYTES) {
      this.error = 'Image is too large. Max 3MB allowed.';
      this.cdr.markForCheck();
      return;
    }

    this.imageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    this.error = '';

    if (this.loading) return;
    if (this.form.invalid) {
      this.error = 'Please fill required fields correctly.';
      Object.values(this.form.controls).forEach(control => control.markAsTouched());
      this.cdr.markForCheck();
      return;
    }
    if (!this.imageFile) {
      this.error = 'Please select a store image.';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const fd = new FormData();
    fd.append('image', this.imageFile);
    fd.append('name', this.form.value.name.trim());
    fd.append('description', this.form.value.description?.trim() ?? '');

    const sub = this.storesSvc.addStores(fd).subscribe({
      next: (res: any) => {
        if (res?.updateUser && typeof (this.shared as any).setUserData === 'function') {
          (this.shared as any).setUserData(res.updateUser);
        } else if (res?.newStore && typeof (this.shared as any).setUserData === 'function') {
          const patchedUser = { ...(this.shared as any).currentUserData ?? {}, storeId: res.newStore._id };
          (this.shared as any).setUserData(patchedUser);
        } else if ((this.shared as any).updateUserData) {
          (this.shared as any).updateUserData();
        }

        const storeId = res?.newStore?._id ?? res?.newStore;
        if (storeId) {
          
          this.router.navigate([`/store/${storeId}/admin`]);
        } else {
          this.router.navigate(['/yourStore']);
        }
      },
      error: (err: any) => {
        console.error('createStore error', err);
        this.error = err?.error?.message ?? 'Failed to create store. Try again later.';
        this.loading = false;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    this.subs.push(sub);
  }

  removeImage(): void {
    this.imageFile = null;
    this.previewUrl = null;
    const input = document.querySelector<HTMLInputElement>('#store-image-input');
    if (input) input.value = '';
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
