export function OutputTest(props: { emit1: (value: any) => void; emit2: (value: any) => void }) {
  return (
    <>
      <button className="btn1" onClick={() => props.emit1('value1')}></button>
      <button className="btn2" onClick={() => props.emit2('value2')}></button>
    </>
  );
}
