export function TypedEmit(props: {
  name?: string;
  count?: number;
  onChange: (value: number) => void;
  onSubmit: () => void;
}) {
  return (
    <div class="typed-emit">
      <span class="name">{props.name}</span>
      <span class="count">{props.count}</span>
      <button class="btn-change" onClick={() => props.onChange(42)}></button>
      <button class="btn-submit" onClick={() => props.onSubmit()}></button>
    </div>
  );
}
