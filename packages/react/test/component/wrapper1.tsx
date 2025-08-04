export function Wrapper1(props: { children: any; input1?: string; class: string }) {
  return (
    <>
      <div className={'wrapper1 ' + (props.class??'')}>
        {props.input1 ?? ''}
        {props.children}
      </div>
    </>
  );
}
