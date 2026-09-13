import { arrayStartsWith } from '@piying/view-angular-core';

describe('arrayStartsWith', () => {
  it('数组前缀命中', () => {
    expect(arrayStartsWith(['a', 'b', 'c'], ['a', 'b'])).toBeTrue();
    expect(arrayStartsWith(['a', 'b', 'c'], ['a', 'b', 'c'])).toBeTrue();
  });
  it('数组前缀不命中', () => {
    expect(arrayStartsWith(['a', 'b', 'c'], ['a', 'x'])).toBeFalse();
    expect(arrayStartsWith(['a'], ['a', 'b'])).toBeFalse();
  });
  it('单个值会被包装成数组', () => {
    expect(arrayStartsWith(['a', 'b'], 'a')).toBeTrue();
    expect(arrayStartsWith(['a', 'b'], 'b')).toBeFalse();
  });
  it('空前缀恒为真', () => {
    expect(arrayStartsWith(['a'], [])).toBeTrue();
  });
});
