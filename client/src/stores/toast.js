import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);
  let nextId = 0;

  const showToast = (message, type = 'info', duration = 5000) => {
    const id = nextId++;
    toasts.value.push({ id, message, type });
    const timeout = type === 'error' ? 8000 : duration;
    setTimeout(() => removeToast(id), timeout);
  };

  const removeToast = (id) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  return { toasts, showToast, removeToast };
});
