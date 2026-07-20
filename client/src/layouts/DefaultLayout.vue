<script setup>
import { useAppStore } from '../stores/app';
import Sidebar from '../components/layout/Sidebar.vue';
import Header from '../components/layout/Header.vue';
import Toast from '../components/common/Toast.vue';

const appStore = useAppStore();
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-bg">
    <Toast />
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <Header />
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
