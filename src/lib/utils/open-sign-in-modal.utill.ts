import { GLOBAL_NAV_ID } from '$lib/constants/dom-element-ids.const';

export function openSignInModal() {
  const signInButton =
    document.getElementById(GLOBAL_NAV_ID)!.firstElementChild!;

  if (!signInButton) {
    console.warn('Unable to proceed with download at this time.');
    return;
  }

  (signInButton as HTMLButtonElement).click();
}
