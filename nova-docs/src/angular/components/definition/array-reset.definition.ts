import * as v from 'valibot';

export const schema = v.pipe(v.optional(v.array(v.string()), ['default1', 'default2']));
