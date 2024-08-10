import _ from 'lodash';

export const IP_ADDRESS_MAPPING = {
  '::1': '212.59.70.23'
};

export function getMappedIpAddress(ipAddress: string): string {
  return _.get(IP_ADDRESS_MAPPING, ipAddress, ipAddress);
}
