import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button-link',
  templateUrl: './component.html',
  imports: [RouterLink],
})
export class ButtonLinkComponent {
  label = input<string>();
  href = input<string>();
  type = input<string>();
  imgLink = input<string>();
  externalLink = input<string>();
}
