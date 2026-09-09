import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'filter-group',
  templateUrl: './component.html',
  imports: [NgTemplateOutlet, FormsModule],
})
export default class FilterFGC extends PiyingViewGroupBase {
  searchContent$ = signal('');
  searchFields$$ = computed(() => {
    const content = this.searchContent$().trim().toLocaleLowerCase();
    if (!content) {
      return [];
    }
    return this.field$$().children!().filter((item) =>
      item.props()['title']?.toLocaleLowerCase().includes(content),
    );
  });
}
