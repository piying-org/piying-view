import { signal } from '@angular/core';
import * as v from 'valibot';

import { createSchemaComponent } from './util/create-component';
import { actions, NFCSchema, setComponent } from '@piying/view-angular-core';
import { Slots1Component } from './slots1/component';
import { Slots1WrapperComponent } from './slots1-wrapper/component';
import { Slots2WrapperComponent } from './slots2-wrapper/component';
import { Slots3WrapperComponent } from './slots3-wrapper/component';
import { SlotService } from './slots-child/service';

describe('slot', () => {
  it('hello', async () => {
    const define = v.object({
      key1: v.pipe(
        NFCSchema,
        setComponent(Slots1Component),
        actions.wrappers.patch([{ type: Slots1WrapperComponent }]),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
    );
    expect(element).toBeTruthy();
    fixture.detectChanges();
    const el = element.querySelector('.slot1 .slot1-content');
    expect(el).toBeTruthy();
    expect(el!.textContent!.trim()).toEqual('slot1Content');
  });
  it('dynamic', async () => {
    const value = signal('content1');
    const define = v.pipe(
      NFCSchema,
      setComponent(Slots1Component),
      actions.wrappers.patch([{ type: Slots2WrapperComponent }]),
      actions.props.patchAsync({
        value: () => value,
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
    );
    expect(element).toBeTruthy();
    fixture.detectChanges();
    const el = element.querySelector('.slot1 .slot1-content');
    expect(el).toBeTruthy();
    expect(el!.textContent!.trim()).toEqual('content1');
    value.set('content2');
    fixture.detectChanges();
    expect(el!.textContent!.trim()).toEqual('content2');
  });
  it('destroy', async () => {
    const define = v.pipe(
      NFCSchema,
      setComponent(Slots1Component),
      actions.wrappers.patch([{ type: Slots3WrapperComponent }]),
      actions.providers.patch([SlotService]),
    );
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(undefined),
    );
    expect(element).toBeTruthy();
    fixture.detectChanges();
    const el = element.querySelector('.slot1 app-slots1-content');
    expect(el).toBeTruthy();
    expect(el!.textContent!.trim()).toEqual('content1');
    fixture.destroy();
    const slotService = field$$()?.injector.get(SlotService);
    expect(slotService?.destroyed).toBeTrue();
  });
});
