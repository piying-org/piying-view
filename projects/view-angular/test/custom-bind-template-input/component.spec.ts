import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { CustomBindComponent } from './component';
import { provideZonelessChangeDetection } from '@angular/core';
import * as v from 'valibot';
import { getField } from '@piying/view-angular-core/test';
import { PiResolvedViewFieldConfig } from '../../lib/type';
import { Test1Component } from '../test1/test1.component';
import { actions } from '@piying/view-angular-core';
import { htmlInput } from '../util/input';
describe('field-template-use-define', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomBindComponent],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const field1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fixture = TestBed.createComponent(CustomBindComponent);
    const el = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput(
      'schema',
      v.pipe(
        v.string(),
        getField(field1$),
        v.title('title1'),
        actions.inputs.patch({ input1: 'value1' }),
      ),
    );
    fixture.componentRef.setInput('options', {
      fieldGlobalConfig: { types: { string: { type: Test1Component } } },
    });
    fixture.detectChanges();
    const mode1Input = el.querySelector('input')!;
    expect(mode1Input).toBeTruthy();
    const input1El = el.querySelector('.test1-div-input1')!;
    expect(input1El.textContent.trim()).toEqual('value1');
    htmlInput(mode1Input, 'inputValue');
    const field = await field1$.promise;
    expect(field.form.control!.value).toEqual('inputValue');
  });
});
