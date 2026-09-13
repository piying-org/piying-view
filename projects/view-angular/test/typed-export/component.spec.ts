import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PiyingFieldControlBindDirective } from '@piying/view-angular';
import { htmlInput } from '../util/input';
import { TypedExportRuntimeComponent } from './runtime.component';

describe('typed export (fieldTemplate / formControl)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypedExportRuntimeComponent],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(TypedExportRuntimeComponent);
    const bind = fixture.componentInstance.bind();
    bind.form.control?.updateValue({
      a: 'A',
      b: 'B',
      n: 1,
      list: [{ c: 9, s: 'S' }],
    });
    fixture.detectChanges();
    const dirs = fixture.debugElement
      .queryAll(By.directive(PiyingFieldControlBindDirective))
      .map((d) => d.injector.get(PiyingFieldControlBindDirective)!);
    return { fixture, bind, dirs, el: fixture.nativeElement as HTMLElement };
  }

  it('field$$() 按 path 解析到与 bind().get(path) 相同的字段', () => {
    const { bind, dirs } = setup();
    expect(dirs.length).toBe(3);
    expect(dirs[0].field$$()).toBe(bind.get(['a']));
    expect(dirs[1].field$$()).toBe(bind.get(['list', 0, 'c']));
    expect(dirs[2].field$$()).toBe(bind.get(['@bb']));
    expect(dirs[2].field$$()!.keyPath).toEqual(['b']);
  });

  it('输入值仍正常回写到对应字段(运行时行为未变)', () => {
    const { bind, el } = setup();
    htmlInput(el.querySelector('.f-a') as HTMLInputElement, 'hello');
    expect(bind.get(['a'])!.form.control!.value).toBe('hello');
    htmlInput(el.querySelector('.f-alias') as HTMLInputElement, 'world');
    expect(bind.get(['b'])!.form.control!.value).toBe('world');
  });
});
