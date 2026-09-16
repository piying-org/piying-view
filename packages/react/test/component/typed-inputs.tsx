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
    <div className="typed-inputs">
      <span className="label">{props.label}</span>
      <span className="count">{props.count}</span>
      <span className="enabled">{String(props.enabled)}</span>
      <span className="tags">{(props.tags ?? []).join(',')}</span>
      <span className="meta">
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
    <div className="typed-emit-multi">
      <button className="btn-range" onClick={() => props.onRange(1, 'z')} />
      <button className="btn-tag" onClick={() => props.onTag(0, 'a', true)} />
    </div>
  );
}
