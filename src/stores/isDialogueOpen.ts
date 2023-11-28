import { writable } from 'svelte/store';

export const isDialogueOpenStore = writable<boolean>(true);

export function toggleDialgoue(): void {
  isDialogueOpenStore.update((v) => !v);
}
