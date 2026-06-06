import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { CustomBindComponent } from './component';
import { provideZonelessChangeDetection } from '@angular/core';
import * as v from 'valibot';
import { htmlInput } from '../util/input';
import { getField } from '@piying/view-angular-core/test';
import { PiResolvedViewFieldConfig } from '../../lib/type';
describe('custom-bind', () => {
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
    const field2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fixture = TestBed.createComponent(CustomBindComponent);
    const instance = fixture.componentInstance;
    fixture.componentRef.setInput(
      'schema1',
      v.pipe(v.string(), getField(field1$), v.title('title1')),
    );
    fixture.componentRef.setInput(
      'schema2',
      v.pipe(v.object({ k1: v.string() }), getField(field2$)),
    );
    fixture.detectChanges();
    const field1 = await field1$.promise;
    const field2 = await field2$.promise;
    expect(instance).toBeTruthy();
    const mode1Input = fixture.nativeElement.querySelector('.mode1');
    expect(mode1Input).toBeTruthy();
    htmlInput(mode1Input, 'inputValue');
    fixture.detectChanges();
    const mode2Input = fixture.nativeElement.querySelector('.mode2');
    expect(mode2Input).toBeTruthy();
    htmlInput(mode2Input, 'inputValue2');
    expect(field1.form.control!.value).toBe('inputValue');
    expect(field2.get(['k1'])!.form.control!.value).toBe('inputValue2');
    const labelEl = fixture.nativeElement.querySelector(
      'label',
    ) as HTMLLabelElement;
    expect(labelEl.textContent!.trim()).toEqual('title1');
  });
});
