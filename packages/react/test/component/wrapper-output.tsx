export function WrapperOutput(props: { children: any; output1: (value: any) => void }) {
  return (
    <>
      <button className="wrapper-btn" onClick={() => props.output1('1')}></button>
      <div className="wrapper2">{props.children} </div>
    </>
  );
}
