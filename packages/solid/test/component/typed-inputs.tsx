export interface TypedInputsMeta {
  id: number;
  name: string;
}

/** 每个 input 都带真实值类型, 方便看出「类型到底从哪来」 */
export function TypedInputs(props: {
  label: string;
  count: number;
  enabled?: boolean;
  tags?: string[];
  meta?: TypedInputsMeta;
}) {
  return (
    <div class="typed-inputs">
      <span class="label">{props.label}</span>
      <span class="count">{props.count}</span>
      <span class="enabled">{String(props.enabled)}</span>
      <span class="tags">{(props.tags ?? []).join(',')}</span>
      <span class="meta">
        {props.meta ? `${props.meta.id}:${props.meta.name}` : ''}
      </span>
    </div>
  );
}

/** 多参数 emit, 用来验证回调参数元组是否被原样保留 */
export function TypedEmitMulti(props: {
  onRange: (start: number, end: string) => void;
  onTag: (index: number, tag: string, ok: boolean) => void;
}) {
  return (
    <div class="typed-emit-multi">
      <button class="btn-range" onClick={() => props.onRange(1, 'z')} />
      <button class="btn-tag" onClick={() => props.onTag(0, 'a', true)} />
    </div>
  );
}
