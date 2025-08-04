export function isEmpty(value: any) {
  expect(
    value === undefined ||
      (typeof value === 'object' && Object.keys(value).length === 0),
  ).toBeTrue();
}
