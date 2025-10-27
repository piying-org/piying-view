export class ParentMap<KEY, VALUE> extends Map<KEY, VALUE> {
  constructor(private parent?: ParentMap<KEY, VALUE>) {
    super();
  }
  override get(key: KEY): VALUE | undefined {
    const result = super.get(key);
    if (result === undefined) {
      return this.parent?.get(key);
    }
    return result;
  }
}
