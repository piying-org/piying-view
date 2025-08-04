export class SortedArray<T> extends Array {
  #compareFn;
  constructor(compareFn: (a: T, b: T) => number) {
    super();
    this.#compareFn = compareFn;
  }

  override push(...items: any[]): number {
    const result = super.push(...items);
    this.sort(this.#compareFn);
    return result;
  }
}
