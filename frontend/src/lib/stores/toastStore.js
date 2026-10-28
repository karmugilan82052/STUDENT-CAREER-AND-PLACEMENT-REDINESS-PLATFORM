import { writable } from 'svelte/store';

export const toastStore = writable([]);

export function showToast(message, type = 'success', duration = 3000) {
  const id = Math.random().toString(36).substr(2, 9);
  toastStore.update(toasts => [...toasts, { id, message, type }]);

  setTimeout(() => {
    toastStore.update(toasts => toasts.filter(t => t.id !== id));
  }, duration);
}
