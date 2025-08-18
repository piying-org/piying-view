export function delay(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, timeout);
  });
}
