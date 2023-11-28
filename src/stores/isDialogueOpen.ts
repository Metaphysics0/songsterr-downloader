import { writable } from 'svelte/store';

export const isDialogueOpenStore = writable<boolean>(false);

export function toggleDialgoue(): void {
  isDialogueOpenStore.update((v) => !v);
}
