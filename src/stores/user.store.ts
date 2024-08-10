import { User } from '@prisma/client';
import { writable } from 'svelte/store';

export const userStore = writable<User | undefined>();
