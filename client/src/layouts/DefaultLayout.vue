<script setup>
import { useAppStore } from '../stores/app';
import Sidebar from '../components/layout/Sidebar.vue';
import Header from '../components/layout/Header.vue';
import Toast from '../components/common/Toast.vue';

const appStore = useAppStore();
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Toast />
    <Sidebar />
    <div :class="['transition-all duration-300', appStore.sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64']">
      <Header />
      <main class="pt-16 p-3 sm:p-4 lg:p-6 overflow-x-hidden">
        <router-view />
      </main>
    </div>
  </div>
</template>
