import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormComponent implements OnInit, OnDestroy {
  storeId!: string | null;
  form!: FormGroup;
  images: File[] = [];
  previews: string[] = [];
  loading = false;
  error = '';
  isEditMode = false;
  productId: string | null = null;
  subs: Subscription[] = [];

  readonly MAX_IMAGES = 6;
  readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  constructor(
    private fb: FormBuilder,
    private productsSvc: ProductsService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      discount: [0],
      totalItems: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null],
      tags: [''],
      attributes: this.fb.array([]) // FormArray of { key, value }
    });
  }

  ngOnInit(): void {
    const pid = this.route.snapshot.paramMap.get('productId');
    const sid = this.route.parent?.snapshot.paramMap.get('id');
    if (!this.storeId && sid) this.storeId = sid;
    if (pid) {
      this.isEditMode = true;
      this.productId = pid;
      this.loadProductForEdit(pid);
    }
  }

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  addAttribute(key = '', value = '') {
    this.attributes.push(this.fb.group({ key: [key], value: [value] }));
    this.cdr.markForCheck();
  }

  removeAttribute(index: number) {
    this.attributes.removeAt(index);
    this.cdr.markForCheck();
  }

  onFilesSelected(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    if (!files.length) return;
    for (const f of files) {
      if (this.images.length >= this.MAX_IMAGES) break;
      if (!f.type.startsWith('image/')) continue;
      if (f.size > this.MAX_IMAGE_SIZE) continue;
      this.images.push(f as File);
      const reader = new FileReader();
      reader.onload = () => {
        this.previews.push(reader.result as string);
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(f);
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
    this.previews.splice(index, 1);
    this.cdr.markForCheck();
  }

  private loadProductForEdit(productId: string) {
    this.loading = true;
    this.cdr.markForCheck();
    const sub = this.productsSvc.getProduct(productId).subscribe({
      next: (res: any) => {
        const p = res?.product;
        if (!p) {
          this.error = 'Product not found';
          return;
        }
        this.form.patchValue({
          name: p.name,
          description: p.description,
          price: p.price,
          discount: p.discount ?? 0,
          totalItems: p.totalItems ?? 0,
          categoryId: p.categoryId ?? null,
          tags: (p.tags ?? []).join(',')
        });
        if (Array.isArray(p.attributes)) {
          p.attributes.forEach((attr: any) => this.addAttribute(attr.key, attr.value));
        }
        if (Array.isArray(p.images)) {
          this.previews = p.images.map((im: any) => (im.url ? im.url : im));
        }
      },
      error: (err: any) => {
        console.error('load product', err);
        this.error = 'Failed to load product';
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
    this.subs.push(sub);
  }

  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please fix the errors';
      this.cdr.markForCheck();
      return;
    }
    if (this.loading) return;
    this.loading = true;
    this.cdr.markForCheck();

    const fd = new FormData();
    fd.append('name', this.form.value.name.trim());
    fd.append('description', this.form.value.description ?? '');
    fd.append('price', String(this.form.value.price));
    if (this.form.value.discount != null) fd.append('discount', String(this.form.value.discount));
    fd.append('totalItems', String(this.form.value.totalItems));
    if (this.form.value.categoryId) fd.append('categoryId', this.form.value.categoryId);
    if (this.form.value.tags) fd.append('tags', String(this.form.value.tags));
    const attrs = (this.form.value.attributes ?? []).filter((a: any) => a.key && a.value);
    if (attrs.length) fd.append('attributes', JSON.stringify(attrs));
    this.images.forEach((f) => fd.append('images', f, f.name));
    if (this.storeId) fd.append('storeId', String(this.storeId));

    const obs = this.isEditMode && this.productId
      ? this.productsSvc.editProduct(this.productId, fd)
      : this.productsSvc.addProduct(fd);

    const sub = obs.subscribe({
      next: (res: any) => {
        this.router.navigate(['/store', this.storeId, 'admin', 'products']);
      },
      error: (err: any) => {
        console.error('save product', err);
        this.error = err?.error?.message ?? 'Failed to save product';
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    this.subs.push(sub);
  }

  cancel() {
    this.router.navigate(['/store', this.storeId, 'admin', 'products']);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
