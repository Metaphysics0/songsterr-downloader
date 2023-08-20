import type { IGuitarProBufferObject } from '$lib/server/bulkDownloadService';

export function bytesToKilobytes(bytes: number): number {
  return bytes / 1024;
}

export function getTotalSizeOfArrayBuffers(
  bufferObjets: IGuitarProBufferObject[]
): number {
  const sizeArray = bufferObjets.map((obj) => obj.buf.byteLength);
  return sizeArray.reduce((acc, cv) => acc + cv, 0);
}
