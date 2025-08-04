declare const expect: any;

export function keyEqual(input1: any, input2: any) {
  if (input1 === input2) {
    expect(input1).toEqual(input2);
    return;
  }

  if (input1 === undefined || input2 === undefined) {
    expect(input1).toEqual(input2);
    return;
  }
  input1 = Array.isArray(input1)
    ? input1
    : input1 === undefined
      ? []
      : [input1];
  input2 = Array.isArray(input2)
    ? input2
    : input2 === undefined
      ? []
      : [input2];

  if (input1.length !== input2.length) {
    throw new Error(`${input1} != ${input2}`);
  }
  for (let index = 0; index < input1.length; index++) {
    const i1 = input1[index];
    const i2 = input2[index];
    expect(i1).toEqual(i2);
  }
}
