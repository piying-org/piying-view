import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import * as v from 'valibot';
import { getField } from '@piying/view-angular-core/test';
import { PiResolvedViewFieldConfig } from '../../lib/type';
import { FieldTemplateOnInitComponent } from './component';
import { Test1Component } from '../test1/test1.component';

describe('field-template onInit 输入', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldTemplateOnInitComponent],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();
  });

  function setup(schema: v.BaseSchema<any, any, any>) {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fixture = TestBed.createComponent(FieldTemplateOnInitComponent);
    const el = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput(
      'schema',
      v.pipe(schema as any, getField(field$) as any),
    );
    fixture.componentRef.setInput('options', {
      fieldGlobalConfig: { types: { string: { type: Test1Component } } },
    });
    return { field$, fixture, el };
  }

  it('onInit 在初始化时以解析后的字段调用一次', async () => {
    const { field$, fixture, el } = setup(v.string());
    const calls: PiResolvedViewFieldConfig[] = [];
    fixture.componentRef.setInput('onInit', (field: PiResolvedViewFieldConfig) =>
      calls.push(field),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const field = await field$.promise;
    expect(calls.length).toBe(1);
    expect(calls[0]).toBe(field);
    expect(el.querySelector('input')).toBeTruthy();
  });

  it('onInit 支持闭包捕获外部变量', async () => {
    const { field$, fixture, el } = setup(v.string());
    let called = false;
    const captured = (() => {
      const prefix = 'captured-';
      return (field: PiResolvedViewFieldConfig) => {
        called = true;
        expect(prefix).toEqual('captured-');
        expect(field).toBeTruthy();
      };
    })();
    fixture.componentRef.setInput('onInit', captured);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await field$.promise;
    expect(called).toBeTrue();
    expect(el.querySelector('input')).toBeTruthy();
  });

  it('onInit 中设置 field inputs 会生效到 DOM', async () => {
    const { field$, fixture, el } = setup(v.string());
    fixture.componentRef.setInput(
      'onInit',
      (field: PiResolvedViewFieldConfig) => {
        field.inputs.set({ input1: 'initialValue' });
      },
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await field$.promise;
    expect(
      el.querySelector('.test1-div-input1')!.textContent!.trim(),
    ).toEqual('initialValue');
  });

  it('未提供 onInit 时不报错', async () => {
    const { field$, fixture, el } = setup(v.string());
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await field$.promise;
    expect(el.querySelector('input')).toBeTruthy();
  });
});
