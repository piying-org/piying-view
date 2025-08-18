export function WrapperOutput(props: { children: any; output1: (value: any) => void }) {
  return (
    <>
      <button class="wrapper-btn" onClick={() => props.output1('1')}></button>
      <div class="wrapper2">{props.children} </div>
    </>
  );
}
