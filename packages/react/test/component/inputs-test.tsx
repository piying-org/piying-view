export function InputsTest(props: { value1?: string; value2?: number }) {
  return (
    <div className="inputs-test">
      {props.value1}
      {props.value2}
    </div>
  );
}
