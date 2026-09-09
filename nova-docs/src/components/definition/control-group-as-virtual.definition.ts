import * as v from 'valibot';

export const schema = v.intersect([v.object({ name: v.string() }), v.object({ age: v.number() })]);
