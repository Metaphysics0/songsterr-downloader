import { SUPPORTED_DOWNLOAD_TAB_TYPES } from '$lib/constants';
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return SUPPORTED_DOWNLOAD_TAB_TYPES.includes(param);
};
