export function isValidIpAddress(ip: string) {
  const ipAddressRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipAddressRegex.test(ip)) return false;

  const octets = ip.split('.');

  for (let octet of octets) {
    const num = parseInt(octet, 10);
    if (num < 0 || num > 255) return false;
    if (octet.length > 1 && octet[0] === '0') return false;
  }

  return true;
}
