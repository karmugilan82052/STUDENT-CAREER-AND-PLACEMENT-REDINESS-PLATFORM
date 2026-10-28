import { writable } from 'svelte/store';

export const authStore = writable({
  user: null,
  profile: null,
  loading: true,
  role: null // 'student' | 'admin' | null
});
