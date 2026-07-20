<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useAppStore } from '../../stores/app';

const authStore = useAuthStore();
const appStore = useAppStore();
const router = useRouter();
const route = useRoute();

const dropdownOpen = ref(false);

const breadcrumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean);
  const crumbs = [{ label: 'Home', path: '/dashboard' }];
  let currentPath = '';
  for (const segment of segments) {
    currentPath += '/' + segment;
    const label = segment
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, path: currentPath });
  }
  return crumbs;
});

const userInitials = computed(() => {
  const first = authStore.user?.firstName?.[0] || '';
  const last = authStore.user?.lastName?.[0] || '';
  return (first + last).toUpperCase();
});

const handleLogout = async () => {
  dropdownOpen.value = false;
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <header class="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
    <div class="flex items-center gap-3 min-w-0">
      <button @click="appStore.toggleMobileSidebar" class="p-2 hover:bg-surface-alt rounded-md transition-colors lg:hidden">
        <svg class="w-5 h-5 text-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button @click="appStore.toggleSidebar" class="p-2 hover:bg-surface-alt rounded-md transition-colors hidden lg:block">
        <svg class="w-5 h-5 text-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div class="relative hidden sm:block">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search..."
          class="w-full max-w-[320px] pl-9 pr-12 py-1.5 bg-surface-alt border border-border rounded-lg text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd class="inline-flex items-center px-1.5 py-0.5 text-[0.6875rem] font-medium text-muted bg-surface border border-border rounded">⌘K</kbd>
        </div>
      </div>

      <nav class="hidden md:flex items-center text-[0.8125rem] min-w-0">
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
          <span v-if="index > 0" class="text-border text-xs mx-1.5">/</span>
          <router-link
            v-if="index < breadcrumbs.length - 1"
            :to="crumb.path"
            class="text-muted hover:text-fg transition-colors truncate"
          >
            {{ crumb.label }}
          </router-link>
          <span v-else class="text-fg font-medium truncate">{{ crumb.label }}</span>
        </template>
      </nav>
    </div>

    <div class="flex items-center gap-2">
      <button class="relative p-2 hover:bg-surface-alt rounded-md transition-colors">
        <svg class="w-5 h-5 text-fg-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <div class="relative">
        <button @click="dropdownOpen = !dropdownOpen" class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium transition-opacity hover:opacity-90">
          {{ userInitials }}
        </button>

        <div v-if="dropdownOpen" class="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border py-2 z-50">
          <div class="px-4 py-2 border-b border-border">
            <p class="text-sm font-medium text-fg">{{ authStore.fullName }}</p>
            <p class="text-xs text-muted">{{ authStore.user?.email }}</p>
          </div>
          <button @click="handleLogout" class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-surface-alt flex items-center gap-2 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
