export function getRandomElementFromArray<T>(a: T[]) {
  return a[Math.floor(Math.random() * a.length)];
}

export function convertArrayBufferToArray(arrayBuffer: ArrayBuffer) {
  return Array.from(new Uint8Array(arrayBuffer));
}
