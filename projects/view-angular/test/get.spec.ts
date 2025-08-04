import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import * as v from 'valibot';
import { getField } from './util/action';
import { asVirtualGroup } from '@piying/valibot-visit';
import { layout } from '@piying/view-angular-core';
import { setComponent, setAlias } from '@piying/view-angular-core';
import { keyEqual } from '@piying/view-angular-core/test';

describe('get查询', () => {
  it('带数组', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ v1: ['d1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await fields$.promise;
    const result = field.get(['#', 'v1', 0]);
    expect(result!.keyPath).toEqual([0]);
    expect(result).toBeTruthy();
  });
  it('数组路径', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.tuple([
          v.pipe(v.string(), setComponent('test1'), layout({ keyPath: ['#'] })),
        ]),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ v1: ['d1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await fields$.promise;
    const result = field.get(['#', 'v1', 0]);
    expect(result!.keyPath).toEqual(['v1', 0]);
    expect(result).toBeTruthy();
  });
  it('快速查询', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

    const define = v.object({
      v1: v.pipe(
        v.intersect([
          v.object({
            v2: v.pipe(
              v.object({
                v3: v.pipe(v.string(), getField(fields$)),
                array1: v.pipe(
                  v.array(
                    v.object({
                      item1: v.pipe(v.string(), setAlias('item1')),
                    }),
                  ),
                  setAlias('array'),
                ),
              }),
              setAlias('test'),
            ),
          }),
          v.object({
            v23: v.object({}),
          }),
        ]),
        asVirtualGroup(),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({
        v1: { v2: { array1: [{ item1: 'value1' }] } },
      }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const getFn = (await fields$.promise).get;
    let result = getFn(['#', 'v1']);
    keyEqual(result!.keyPath, 'v1');
    result = getFn(['@test']);
    keyEqual(result!.keyPath, 'v2');
    result = getFn(['@test', 'v3']);
    keyEqual(result!.keyPath, 'v3');
    result = getFn(['..', 'v3']);
    keyEqual(result!.keyPath, 'v3');
    result = getFn(['#', 'v1', 'v23']);
    keyEqual(result!.keyPath, 'v23');
    result = getFn(['@test', '@array', 0, '@item1']);
    keyEqual(result!.keyPath, 'item1');
    result = getFn(['@test', '@array', 0, '@item1', '@test']);
    keyEqual(result!.keyPath, 'v2');
  });
  it('root 查询', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

    const define = v.pipe(
      v.intersect([
        v.object({
          v2: v.pipe(
            v.object({ v3: v.pipe(v.string(), getField(fields$)) }),
            setAlias('test'),
          ),
        }),
      ]),
      asVirtualGroup(),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({}),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const getFn = (await fields$.promise).get;
    const result = getFn(['#', 'v2']);
    keyEqual(result!.keyPath, 'v2');
  });
  it('前缀相同查询', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.object({
          k1: v.pipe(
            v.object({
              k2: v.pipe(
                v.object({}),
                layout({ keyPath: ['..', '..'], priority: 1 }),
              ),
            }),
          ),
        }),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ v1: ['d1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await fields$.promise;
    const result = field.get(['#', 'v1', 'k1', 'k2']);
    expect(result!.keyPath).toEqual(['k1', 'k2']);
    expect(result).toBeTruthy();
  });
  it('root查询', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(v.string(), getField(fields$)),
      v2: v.string(),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({}),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await fields$.promise;
    let result = field.get(['..', 'v2']);
    expect(result).toBeTruthy();
    expect(result!.keyPath).toEqual(['v2']);
    result = field.get(['#']);
    expect(result).toBeTruthy();
  });
});
