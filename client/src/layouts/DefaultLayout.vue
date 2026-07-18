<script setup>
import { useAppStore } from '../stores/app';
import Sidebar from '../components/layout/Sidebar.vue';
import Header from '../components/layout/Header.vue';

const appStore = useAppStore();
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Sidebar />
    <div :class="['transition-all duration-300', appStore.sidebarCollapsed ? 'ml-16' : 'ml-64']">
      <Header />
      <main class="pt-16 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
