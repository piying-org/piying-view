import { layout } from '@piying/view-angular-core';
import * as v from 'valibot';
import { Test1Component } from './test1/test1.component';
import { createSchemaComponent } from './util/create-component';
import { signal } from '@angular/core';
describe('layout', () => {
  it('移动布局', async () => {
    const define = v.object({
      input0: v.pipe(v.string()),
      input1: v.pipe(v.string(), layout({ keyPath: ['#', '@ly1'] })),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({}),
      {
        types: {
          string: { type: Test1Component },
        },
      },
    );
    expect(true).toEqual(true);
  });
  xit('移动布局-自身异常', async () => {
    const define = v.object({
      input0: v.pipe(v.string()),
      input1: v.pipe(v.string(), layout({ keyPath: ['#', '@ly1'] })),
    });
    try {
      const { fixture, instance, element } = await createSchemaComponent(
        signal(define),
        signal({}),
        {
          types: {
            string: { type: Test1Component },
          },
        },
      );
      await fixture.whenStable();
      fixture.detectChanges();
    } catch (error) {
      expect(error instanceof Error).toBeTrue();
      expect((error as Error).message).toContain('自身');
      return;
    }
    throw new Error('');
  });
});
