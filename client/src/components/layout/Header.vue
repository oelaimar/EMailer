<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useAppStore } from '../../stores/app';

const authStore = useAuthStore();
const appStore = useAppStore();
const router = useRouter();
const dropdownOpen = ref(false);

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <header class="fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 lg:px-6" :class="appStore.sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'">
    <button @click="appStore.toggleMobileSidebar" class="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <button @click="appStore.toggleSidebar" class="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden lg:block">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <div class="relative">
      <button @click="dropdownOpen = !dropdownOpen" class="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {{ authStore.user?.firstName?.[0] }}{{ authStore.user?.lastName?.[0] }}
        </div>
        <span class="text-sm font-medium text-gray-700 hidden sm:inline">{{ authStore.fullName }}</span>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div v-if="dropdownOpen" class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
        <div class="px-4 py-2 border-b border-gray-100">
          <p class="text-xs text-gray-500">Production ID</p>
          <p class="text-sm font-medium">{{ authStore.user?.productionId }}</p>
        </div>
        <div class="px-4 py-2 border-b border-gray-100">
          <p class="text-xs text-gray-500">Email</p>
          <p class="text-sm font-medium">{{ authStore.user?.email }}</p>
        </div>
        <button @click="handleLogout" class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  </header>
</template>
