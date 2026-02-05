import { Component, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-btn',
  template: `
    <input
      type="text"
      class="form-control"
      placeholder="Search products..."
      (input)="onSearch($event)"
    />
  `,
})
export class SearchBtnComponent {
  @Output() searchChanged = new EventEmitter<string>();

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(value => {
        this.searchChanged.emit(value);
      });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }
}
