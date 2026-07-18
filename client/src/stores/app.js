import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false);
  const sidebarMobileOpen = ref(false);
  const loading = ref(false);

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function toggleMobileSidebar() {
    sidebarMobileOpen.value = !sidebarMobileOpen.value;
  }

  return { sidebarCollapsed, sidebarMobileOpen, loading, toggleSidebar, toggleMobileSidebar };
});
