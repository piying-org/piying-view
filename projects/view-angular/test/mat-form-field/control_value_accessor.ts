/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive()
export class BaseControlValueAccessor {
  /**
   * The registered callback function called when a change or input event occurs on the input
   * element.
   * @docs-private
   */
  onChange = (_: any) => {};

  /**
   * The registered callback function called when a blur event occurs on the input element.
   * @docs-private
   */
  onTouched = () => {};

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
  ) {}

  /**
   * Helper method that sets a property on a target element using the current Renderer
   * implementation.
   * @docs-private
   */
  protected setProperty(key: string, value: any): void {
    this._renderer.setProperty(this._elementRef.nativeElement, key, value);
  }

  /**
   * Registers a function called when the control is touched.
   * @docs-private
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Registers a function called when the control value changes.
   * @docs-private
   */
  registerOnChange(fn: (_: any) => any): void {
    this.onChange = fn;
  }

  /**
   * Sets the "disabled" property on the range input element.
   * @docs-private
   */
  setDisabledState(isDisabled: boolean): void {
    this.setProperty('disabled', isDisabled);
  }
}
