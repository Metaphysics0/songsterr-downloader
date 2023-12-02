import { isValidDownloadType } from '$lib/types/downloadType';
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return isValidDownloadType(param);
};
