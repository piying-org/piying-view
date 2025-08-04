export function toArray(input: any): any[] | undefined {
  return input === undefined
    ? input
    : Array.isArray(input)
      ? input
      : ([input] as const);
}
