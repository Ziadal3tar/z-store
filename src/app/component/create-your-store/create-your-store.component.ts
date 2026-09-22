import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { User } from 'src/app/core/models/user.model';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { StoresService } from 'src/app/services/stores.service';

interface CreateStoreResponse {
  message?: string;
  updateUser?: User;
  newStore?: string | { _id?: string };
}

@Component({
  selector: 'app-create-your-store',
  templateUrl: './create-your-store.component.html',
  styleUrls: ['./create-your-store.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateYourStoreComponent implements OnDestroy {
  @ViewChild('fileInput')
  private fileInput?: ElementRef<HTMLInputElement>;

  form: FormGroup;
  previewUrl: string | null = null;
  imageFile: File | null = null;
  loading = false;
  error = '';
  isDragging = false;

  readonly MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;
  readonly ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly storesService: StoresService,
    private readonly router: Router,
    private readonly userStateService: UserStateService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      description: ['', [Validators.maxLength(1000)]],
    });
  }

  openHome(): void {
    if (this.loading) return;
    this.router.navigate(['/']);
  }

  openFilePicker(): void {
    if (this.loading) return;
    this.fileInput?.nativeElement.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleSelectedFile(input.files?.[0] ?? null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.loading) return;
    this.isDragging = true;
    this.cdr.markForCheck();
  }

  onDragLeave(): void {
    this.isDragging = false;
    this.cdr.markForCheck();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (this.loading) return;

    this.handleSelectedFile(event.dataTransfer?.files?.[0] ?? null);
  }

  submit(): void {
    this.error = '';

    if (this.loading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please fill in the required fields correctly.';
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

    const formData = new FormData();
    formData.append('image', this.imageFile);
    formData.append('name', this.form.get('name')?.value?.trim() ?? '');
    formData.append('description', this.form.get('description')?.value?.trim() ?? '');

    this.storesService
      .addStores(formData)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: CreateStoreResponse) => {
          if (response.updateUser) {
            this.userStateService.setUserData(response.updateUser);
          } else {
            this.userStateService.refresh();
          }

          const storeId = typeof response.newStore === 'string'
            ? response.newStore
            : response.newStore?._id;

          if (storeId) {
            this.router.navigate([`/store/${storeId}/admin`]);
            return;
          }

          this.router.navigate(['/store/create']);
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          console.error('createStore error', err);
          this.error = err.error?.message ?? err.message ?? 'Failed to create store. Please try again later.';
          this.cdr.markForCheck();
        },
      });
  }

  removeImage(): void {
    this.imageFile = null;
    this.previewUrl = null;
    this.error = '';

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    this.cdr.markForCheck();
  }

  private handleSelectedFile(file: File | null): void {
    this.error = '';

    if (!file) return;

    if (!this.ACCEPTED_TYPES.includes(file.type)) {
      this.error = 'Please upload a PNG, JPG or WEBP image.';
      this.clearFileInput();
      this.cdr.markForCheck();
      return;
    }

    if (file.size > this.MAX_IMAGE_SIZE_BYTES) {
      this.error = 'Image is too large. Maximum size is 3MB.';
      this.clearFileInput();
      this.cdr.markForCheck();
      return;
    }

    this.imageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = typeof reader.result === 'string' ? reader.result : null;
      this.cdr.markForCheck();
    };
    reader.onerror = () => {
      this.previewUrl = null;
      this.error = 'Unable to preview this image. Please try another file.';
      this.cdr.markForCheck();
    };

    reader.readAsDataURL(file);
    this.cdr.markForCheck();
  }

  private clearFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    this.imageFile = null;
    this.previewUrl = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
