import {
ChangeDetectionStrategy,
Component,
} from '@angular/core';

type AdminTabId =
| 'dashboard'
| 'coupons'
| 'categories'
| 'subcategories'
| 'brands'
| 'products';

interface AdminTab {
id: AdminTabId;
label: string;
description: string;
icon: string;
}

@Component({
selector: 'app-admin',
templateUrl: './admin.component.html',
styleUrls: ['./admin.component.css'],
changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
activeTab: AdminTabId = 'dashboard';

readonly tabs: AdminTab[] = [
{
id: 'dashboard',
label: 'Overview',
description: 'Store administration',
icon: 'bi bi-grid-1x2',
},
{
id: 'coupons',
label: 'Coupons',
description: 'Discount campaigns',
icon: 'bi bi-ticket-perforated',
},
{
id: 'categories',
label: 'Categories',
description: 'Main catalog groups',
icon: 'bi bi-collection',
},
{
id: 'subcategories',
label: 'Subcategories',
description: 'Catalog organization',
icon: 'bi bi-diagram-3',
},
{
id: 'brands',
label: 'Brands',
description: 'Brand management',
icon: 'bi bi-award',
},
{
id: 'products',
label: 'Products',
description: 'Add and manage items',
icon: 'bi bi-box-seam',
},
];

selectTab(tab: AdminTabId): void {
this.activeTab = tab;
}
}
