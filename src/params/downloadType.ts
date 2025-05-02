import { isValidDownloadType } from '$lib/types/supported-tab-download-type';
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return isValidDownloadType(param);
};
