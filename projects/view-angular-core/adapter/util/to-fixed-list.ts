export function toFixedList(
  data: any[],
  labelFn: (arg: any) => any = (a) => a,
) {
  return data.map((item) => ({ label: labelFn(item), value: item }));
}
