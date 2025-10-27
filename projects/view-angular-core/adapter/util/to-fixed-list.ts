export function toFixedList(
  data: any[],
  labelFn: (arg: any) => any = (a) => a,
) {
  return data.map((item) => {
    return { label: labelFn(item), value: item };
  });
}
