export function OutputTest(props: { emit1: (value: any) => void; emit2: (value: any) => void }) {
  return (
    <>
      <button class="btn1" onClick={() => props.emit1('value1')}></button>
      <button class="btn2" onClick={() => props.emit2('value2')}></button>
    </>
  );
}
