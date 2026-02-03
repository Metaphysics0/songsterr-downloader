import { writable } from 'svelte/store';

function createFretwisePromoModalStore() {
  const { subscribe, set } = writable(false);

  return {
    subscribe,
    show: () => set(true),
    hide: () => set(false)
  };
}

export const fretwisePromoModalStore = createFretwisePromoModalStore();
