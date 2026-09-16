export function TypedEmit(props: {
  name?: string;
  count?: number;
  onChange: (value: number) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="typed-emit">
      <span className="name">{props.name}</span>
      <span className="count">{props.count}</span>
      <button
        className="btn-change"
        onClick={() => props.onChange(42)}
      ></button>
      <button className="btn-submit" onClick={() => props.onSubmit()}></button>
    </div>
  );
}
