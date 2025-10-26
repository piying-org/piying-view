import * as v from 'valibot';

export function createImpasseAction(key: string, value?: any) {
  return v.rawCheck(({ dataset, addIssue }) => {
    if (dataset.issues) {
      return;
    }
    addIssue({
      label: `impasse:${key}`,
      expected: '[no validation conflict]',
      received: value,
    });
  });
}
