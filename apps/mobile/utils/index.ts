export function delay(ms: number = 2500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
