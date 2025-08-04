export function arrayStartsWith(list: any[], parts: any[] | any) {
  return (Array.isArray(parts) ? parts : [parts]).every(
    (item, index) => item === list[index],
  );
}
