import { writable } from 'svelte/store';
import { studentService } from '../services/studentService';

export const notificationStore = writable([]);

export async function fetchNotifications(studentId) {
  if (!studentId) {
    notificationStore.set([]);
    return [];
  }
  try {
    const notifs = await studentService.getNotifications(studentId);
    notificationStore.set(notifs);
    return notifs;
  } catch (e) {
    console.error("Error fetching notifications:", e);
    return [];
  }
}
