import { getSchemaMetadata } from '@piying/valibot-visit';
import * as v from 'valibot';

describe('获取元数据', () => {
  it('获取', async () => {
    const title = 'title-1';
    const description = 'description-1';
    const metadata = { m1: '' };
    const k1Schema = v.optional(
      v.pipe(
        v.string(),
        v.title(title),
        v.description(description),
        v.metadata(metadata),
      ),
    );
    const result = getSchemaMetadata(k1Schema);
    expect(result.title).toBe(title);
    expect(result.description).toBe(description);
    expect(result.metadata).toBe(metadata);
  });
});
