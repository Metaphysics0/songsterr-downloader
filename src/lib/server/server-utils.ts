export async function fetchAndReturnBuf(url: string): Promise<ArrayBuffer> {
  const downloadResponse = await fetch(url);
  return downloadResponse.arrayBuffer();
}
