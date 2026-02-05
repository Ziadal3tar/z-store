import { StoresService } from './../../services/stores.service';
import { Component, Input, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CreateYourStoreComponent } from '../create-your-store/create-your-store.component';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.css'],
})
export class UserinfoComponent implements OnInit {
  orders = 'd-none';
  favorites = 'd-none';
  personal = 'd-none';
  settings = 'd-none';
  ordersStyle = '';
  favoritesStyle = '';
  personalStyle = '';
  userData: any;
  storDetails = false;
  image: any;
  storeName = '';
  storeCategory = '';
  storeTitle = '';
  removeTitle = '';
  url: any;
  page: any;
  updatedImg: any;
  name = 'mohammed';
  errMessage: any;
  favcount: any;
  ordersCount: any;
  loading=false
  constructor(
    private SharedService: SharedService,
    private _activatedRoute: ActivatedRoute,
    private UserService: UserService,
    private StoresService: StoresService,
    private Router: Router
  ) {}

  ngOnInit(): void {
    this.SharedService.currentUserData.subscribe((data: any) => {
      this.userData = data;

      this.url = data.profilePic;
      this.storeBtnTitle();
    });
  }

  upload(event: any) {
    const file = event.target.files[0];
    this.image = file;
  }
  // =================== تحسين addStore ===================
addStore(): void {
  this.errMessage = '';

  // حماية: تأكد من وجود صورة واسم المتجر قبل الإرسال
  if (!this.image) {
    this.errMessage = 'Please select a store image.';
    return;
  }
  if (!this.storeName || !this.storeName.trim()) {
    this.errMessage = 'Please enter a store name.';
    return;
  }

  // منع الضغط المتكرر
  if (this.loading) return;
  this.loading = true;

  const formdata = new FormData();
  formdata.append('image', this.image);
  formdata.append('name', this.storeName.trim());

  this.StoresService.addStores(formdata).subscribe({
    next: (data: any) => {
      if (data?.message === 'added') {
        // حدِّث واجهة المستخدم محليًا لو تحب (مثلاً فتح الستور مباشرة)
        // حدّث shared userData لو متوفر
        if (typeof (this.SharedService as any).setUserData === 'function') {
          // إذا السيرفر أرسل newStore و updateUser يمكنك استخدامها لتحديث الحالة المحلية
          (this.SharedService as any).setUserData(data.updateUser ?? { ...this.userData, storeId: data.newStore._id });
        } else if ((this.SharedService as any).updateUserData) {
          // إذا عندك method جاهزة لإعادة جلب/تحديث بيانات المستخدم
          (this.SharedService as any).updateUserData();
        }

        // حدِّث العناوين واذهب للستورد الجديد
        this.storeTitle = 'Open Your Store';
        this.removeTitle = 'delete-store';
        this.Router.navigate([`/yourStore/${data.newStore._id}`]);
      } else if (data?.err) {
        // رسالة خطأ عامة من السيرفر
        this.errMessage = data.errMessage ?? 'You cannot own a store while you are an Admin';
      } else {
        // رد غير متوقع
        this.errMessage = data?.message ?? 'Unexpected response from server';
      }
    },
    error: (err: any) => {
      console.error('addStore error', err);
      this.errMessage = err?.error?.message ?? 'Failed to add store. Try again later.';
    },
    complete: () => {
      this.loading = false;
    }
  });
}

// =================== تحسين storeBtnTitle ===================
storeBtnTitle(): void {
  // حماية: تأكد من وجود userData
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

// =================== تحسين storeBtn ===================
storeBtn(): void {
  if (!this.userData) {
    // إن لم يكن مسجلًا — توجيه للـ login أو إظهار رسالة
    this.Router.navigate(['/login']);
    return;
  }

  if (!this.userData.storeId) {
    // افتح الفورم لإضافة متجر
    this.storDetails = !this.storDetails;
    return;
  }

  // افتح صفحة المتجر الخاص بالمستخدم (تأكد من وجود _id داخل storeId)
  const storeId = this.userData.storeId?._id ?? this.userData.storeId;
  if (storeId) {
    this.Router.navigate(['/store/' + storeId]);
    this.storDetails = false;
  } else {
    // fallback: حاول تحديث بيانات المستخدم أو أظهر رسالة
    if ((this.SharedService as any).updateUserData) {
      (this.SharedService as any).updateUserData();
    }
  }
}

// =================== تحسين deleteStore ===================
deleteStore(): void {
  // حماية: تأكد أن المستخدم يمتلك بالفعل ستور
  if (!this.userData || !this.userData._id) return;

  const storeId = this.userData.storeId?._id ?? this.userData.storeId;
  if (!storeId) {
    console.warn('deleteStore: user has no store');
    return;
  }

  // تأكيد الحذف مع المستخدم
  const ok = confirm('Are you sure you want to delete your store? This action cannot be undone.');
  if (!ok) return;

  if (this.loading) return;
  this.loading = true;

  this.StoresService.deleteStore(storeId).subscribe({
    next: (data: any) => {
      if (data?.message === 'removed') {
        // حدّث الواجهة محليًا بدلاً من الانتظار لإعادة الجلب
        const newUserData = { ...this.userData, storeId: null };
        if (typeof (this.SharedService as any).setUserData === 'function') {
          (this.SharedService as any).setUserData(newUserData);
        } else if ((this.SharedService as any).updateUserData) {
          (this.SharedService as any).updateUserData();
        }

        this.storeTitle = 'Add your store';
        this.removeTitle = '';
      } else {
        console.info('deleteStore unexpected response', data);
      }
    },
    error: (err: any) => {
      console.error('deleteStore error', err);
      // عرض رسالة بسيطة للمستخدم
      alert(err?.error?.message ?? 'Failed to delete store. Try again later.');
    },
    complete: () => {
      this.loading = false;
    }
  });
}

// =================== تحسين updateUserImg ===================
updateUserImg(event: any): void {
  const file: File = event?.target?.files?.[0];
  if (!file) return;

  // يمكنك إضافة فحص نوع الملف/الحجم هنا
  this.updatedImg = file;

  // عرض معاينة آمنة
  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.url = e.target?.result ?? this.url;
  };
  reader.readAsDataURL(file);
}

// =================== تحسين save (تحديث صورة البروفايل) ===================
save(): void {
  if (!this.updatedImg) {
    return;
  }

  if (!this.userData || !this.userData._id) {
    alert('You must be logged in to update profile picture');
    return;
  }

  if (this.loading) return;
  this.loading = true;

  const formdata = new FormData();
  formdata.append('image', this.updatedImg);
  formdata.append('id', this.userData._id);

  this.UserService.editProfilePic(formdata).subscribe({
    next: (data: any) => {
      if (data?.message === 'created' || data?.message === 'Done') {
        // حدّث حالة المستخدم محليًا إن أرسل السيرفر الصورة الجديدة
        if (data?.updatedUser && typeof (this.SharedService as any).setUserData === 'function') {
          (this.SharedService as any).setUserData(data.updatedUser);
        } else if ((this.SharedService as any).updateUserData) {
          (this.SharedService as any).updateUserData();
        }

        this.updatedImg = null;
        // لا تنس إزالة الـ preview أو إعلام المستخدم بالنجاح
        // this.url = data?.updatedUser?.profilePic?.[0] ?? this.url;
      } else {
        console.info('editProfilePic: unexpected response', data);
      }
    },
    error: (err: any) => {
      console.error('editProfilePic error', err);
      alert(err?.error?.message ?? 'Failed to update profile picture');
    },
    complete: () => {
      this.loading = false;
    }
  });
}

// =================== تحسين cancel ===================
cancel(): void {
  // استرجاع الـ preview للصورة الأصلية (لو متوفرة)
  if (this.userData?.profilePic && this.userData.profilePic.length) {
    this.url = this.userData.profilePic[0];
  } else {
    this.url = '';
  }
  this.updatedImg = null;
}

}
