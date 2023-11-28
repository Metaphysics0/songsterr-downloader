export function getRandomElementFromArray<T>(a: T[]) {
  return a[Math.floor(Math.random() * a.length)];
}
