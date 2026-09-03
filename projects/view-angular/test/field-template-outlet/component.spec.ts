import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import * as v from 'valibot';
import { getField } from '@piying/view-angular-core/test';
import { PiResolvedViewFieldConfig } from '../../lib/type';
import { Test1Component } from '../test1/test1.component';
import { htmlInput } from '../util/input';
import { FieldTemplateErrorComponent } from './component';

describe('field-template 异常输出绑定', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldTemplateErrorComponent],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();
  });

  function setup(schema: v.BaseSchema<any, any, any>) {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fixture = TestBed.createComponent(FieldTemplateErrorComponent);
    const el = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput(
      'schema',
      v.pipe(schema as any, getField(field$) as any),
    );
    fixture.componentRef.setInput('options', {
      fieldGlobalConfig: { types: { string: { type: Test1Component } } },
    });
    fixture.detectChanges();
    return { field$, fixture, el };
  }

  function input(el: HTMLElement) {
    return el.querySelector('input') as HTMLInputElement;
  }

  it('valibotIssueSummary$$ 快速显示异常文本', async () => {
    const { field$, fixture, el } = setup(
      v.pipe(v.string(), v.minLength(5)),
    );
    await field$.promise;

    // 先输入有效值,确保无异常文本
    htmlInput(input(el), 'valid');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('.valibot-issue')!.textContent!.trim()).toEqual(
      '',
    );
    expect(el.querySelector('.summary-count')!.textContent!.trim()).toEqual(
      '0',
    );

    // 输入无效值触发异常
    htmlInput(input(el), 'ab');
    await fixture.whenStable();
    fixture.detectChanges();

    const text = el.querySelector('.valibot-issue')!.textContent!;
    expect(text).toContain('Invalid length');
    expect(text).toContain('>=5');
    expect(el.querySelector('.summary-count')!.textContent!.trim()).toEqual(
      '1',
    );
  });

  it('summaryList$$ 支持自定义异常展示', async () => {
    const { field$, fixture, el } = setup(
      v.pipe(v.string(), v.title('自定义异常标题'), v.minLength(5)),
    );
    await field$.promise;

    htmlInput(input(el), 'ab');
    await fixture.whenStable();
    fixture.detectChanges();

    const items = Array.from(
      el.querySelectorAll('.summary-item'),
    ) as HTMLElement[];
    expect(items.length).toBe(1);
    // summaryList$$ 内每一项均携带 valibotIssueSummary 文本
    expect(items[0].textContent!.trim()).toContain('Invalid length');
    expect(items[0].textContent!.trim()).toContain('>=5');
  });

  it('恢复有效值后异常文本清空', async () => {
    const { field$, fixture, el } = setup(
      v.pipe(v.string(), v.minLength(5)),
    );
    await field$.promise;

    htmlInput(input(el), 'ab');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('.summary-count')!.textContent!.trim()).toEqual(
      '1',
    );

    htmlInput(input(el), 'valid');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('.valibot-issue')!.textContent!.trim()).toEqual(
      '',
    );
    expect(el.querySelector('.summary-count')!.textContent!.trim()).toEqual(
      '0',
    );
  });
});
