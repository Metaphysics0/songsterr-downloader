// See https://kit.svelte.dev/docs/types#app

import { ClerkSession } from '$lib/server/clerk/types/clerk.types';

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: ClerkSession; // clerk session
    }
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
