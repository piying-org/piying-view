import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { CustomBind2Component } from './component';
import { provideZonelessChangeDetection } from '@angular/core';
import * as v from 'valibot';
import { htmlInput } from '../util/input';

describe('custom-bind', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomBind2Component],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const fixture = TestBed.createComponent(CustomBind2Component);
    const instance = fixture.componentInstance;
    fixture.componentRef.setInput('schema1', v.pipe(v.number()));

    fixture.detectChanges();
    expect(instance).toBeTruthy();
    const mode1Input = fixture.nativeElement.querySelector('.mode1');
    expect(mode1Input).toBeTruthy();
    htmlInput(mode1Input, '1234');
    let field=fixture.componentRef.instance.bind1()
    expect(field?.form.root.value).toEqual(1234)
  });
});
