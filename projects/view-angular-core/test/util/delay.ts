export function delayOne() {
  return new Promise((res) => {
    setTimeout(() => {
      res(undefined);
    }, 20);
  });
}
export function delay(timeout: number) {
  return new Promise((res) => {
    setTimeout(() => {
      res(undefined);
    }, timeout);
  });
}
