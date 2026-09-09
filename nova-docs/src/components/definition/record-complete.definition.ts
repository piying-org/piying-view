import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  metadata: v.record(v.string(), v.string()),
  settings: v.pipe(
    v.record(v.string(), v.boolean()),
    formConfig({
      groupKeySchema: v.picklist(['darkMode', 'notifications', 'autoSave']),
    }),
  ),
  teamMembers: v.record(
    v.string(),
    v.object({
      name: v.string(),
      role: v.string(),
    }),
  ),
});
