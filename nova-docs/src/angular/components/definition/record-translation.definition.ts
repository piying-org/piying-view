import * as v from 'valibot';

export const schema = v.object({
  translations: v.record(v.picklist(['zh', 'en', 'ja', 'ko']), v.string()),
});

export const model = { translations: { zh: '你好' } };
