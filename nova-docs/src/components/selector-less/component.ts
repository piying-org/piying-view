import { Component, viewChild } from '@angular/core';

@Component({
  selector: 'selectorless-nfcc',
  templateUrl: './component.html',
  standalone: true,
})
export class SelectorlessNFCC {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
}
