<script setup>
import { ref } from 'vue';
import { useAppStore } from '../../stores/app';
import { useRoute } from 'vue-router';

const appStore = useAppStore();
const route = useRoute();
const openSections = ref(['dashboard']);

const toggleSection = (section) => {
  const idx = openSections.value.indexOf(section);
  if (idx > -1) openSections.value.splice(idx, 1);
  else openSections.value.push(section);
};

const isActive = (path) => route.path === path;

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z', path: '/dashboard' },
  { id: 'production', label: 'Production', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', children: [
    { label: 'Production List', path: '/production' },
    { label: 'Add Production', path: '/production/add' },
  ]},
  { id: 'mta', label: 'MTA Servers', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01', children: [
    { label: 'MTA Servers List', path: '/mta-servers' },
    { label: 'Add MTA Server', path: '/mta-servers/add' },
  ]},
  { id: 'smtp', label: 'SMTP Servers', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', children: [
    { label: 'SMTP Servers List', path: '/smtp-servers' },
    { label: 'Add SMTP Server', path: '/smtp-servers/add' },
    { label: 'Bulk Check', path: '/smtp-servers/bulk-check' },
  ]},
  { id: 'smtp-groups', label: 'SMTP Groups', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', children: [
    { label: 'SMTP Groups List', path: '/smtp-groups' },
    { label: 'Add SMTP Group', path: '/smtp-groups/add' },
  ]},
  { id: 'domains', label: 'Domains', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', children: [
    { label: 'Domains List', path: '/domains' },
    { label: 'Add Domain', path: '/domains/add' },
  ]},
  { id: 'data-lists', label: 'Data Lists', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', children: [
    { label: 'Data Lists', path: '/data-lists' },
    { label: 'Add Data List', path: '/data-lists/add' },
  ]},
  { id: 'offers', label: 'Offers', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', children: [
    { label: 'Offers List', path: '/offers' },
    { label: 'Add Offer', path: '/offers/add' },
  ]},
  { id: 'virtual-lists', label: 'Virtual Lists', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z', children: [
    { label: 'Virtual Lists', path: '/virtual-lists' },
    { label: 'Add Virtual List', path: '/virtual-lists/add' },
  ]},
  { id: 'auto-responders', label: 'Auto Responders', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', children: [
    { label: 'Auto Responders List', path: '/auto-responders' },
    { label: 'Add Auto Responder', path: '/auto-responders/add' },
  ]},
  { id: 'affiliate-networks', label: 'Affiliate Networks', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', children: [
    { label: 'Networks List', path: '/affiliate-networks' },
    { label: 'Add Network', path: '/affiliate-networks/add' },
  ]},
  { id: 'gmail', label: 'Gmail API', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', children: [
    { label: 'Accounts List', path: '/gmail-accounts' },
    { label: 'Add Account', path: '/gmail-accounts/add' },
  ]},
  { id: 'gsuite', label: 'G Suite API', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', children: [
    { label: 'Accounts List', path: '/gsuite-accounts' },
    { label: 'Add Account', path: '/gsuite-accounts/add' },
  ]},
  { id: 'outlook', label: 'Outlook API', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', children: [
    { label: 'Accounts List', path: '/outlook-accounts' },
    { label: 'Add Account', path: '/outlook-accounts/add' },
  ]},
  { id: 'cloud', label: 'Cloud APIs', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', children: [
    { label: 'Cloud Accounts', path: '/cloud-accounts' },
    { label: 'Add Cloud Account', path: '/cloud-accounts/add' },
    { label: 'Cloud Instances', path: '/cloud-instances' },
    { label: 'Launch Instance', path: '/cloud-instances/add' },
  ]},
  { id: 'dns', label: 'DNS Management', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', children: [
    { label: 'Registrar Accounts', path: '/registrar-accounts' },
    { label: 'Add Registrar Account', path: '/registrar-accounts/add' },
  ]},
  { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM12.75 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z', children: [
    { label: 'Add Users', path: '/users/add' },
    { label: 'Users List', path: '/users' },
  ]},
  { id: 'roles', label: 'Application Roles', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', children: [
    { label: 'Add Roles', path: '/roles/add' },
    { label: 'Roles List', path: '/roles' },
    { label: 'Affect Roles To Users', path: '/roles/affect' },
    { label: 'Affect Users To Roles', path: '/roles/users' },
  ]},
  { id: 'sessions', label: 'Sessions', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', path: '/sessions' },
];
</script>

<template>
  <aside :class="['fixed left-0 top-0 h-full bg-gray-900 text-white z-40 transition-all duration-300 flex flex-col', appStore.sidebarCollapsed ? 'w-16' : 'w-64']">
    <div class="h-16 flex items-center px-4 border-b border-gray-700">
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm">V</div>
        <span v-if="!appStore.sidebarCollapsed" class="text-lg font-semibold whitespace-nowrap">Vugex V2</span>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto py-4">
      <div v-for="item in menuItems" :key="item.id">
        <button
          v-if="item.children"
          @click="toggleSection(item.id)"
          :class="['w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-800 transition-colors', openSections.includes(item.id) ? 'bg-gray-800' : '']"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
          </svg>
          <span v-if="!appStore.sidebarCollapsed" class="flex-1 text-left whitespace-nowrap">{{ item.label }}</span>
          <svg v-if="!appStore.sidebarCollapsed" :class="['w-4 h-4 transition-transform', openSections.includes(item.id) ? 'rotate-90' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <router-link
          v-else
          :to="item.path"
          :class="['flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-800 transition-colors', isActive(item.path) ? 'bg-gray-800 text-blue-400' : '']"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
          </svg>
          <span v-if="!appStore.sidebarCollapsed" class="whitespace-nowrap">{{ item.label }}</span>
        </router-link>

        <div v-if="item.children && openSections.includes(item.id) && !appStore.sidebarCollapsed" class="bg-gray-950/50">
          <router-link
            v-for="child in item.children"
            :key="child.path"
            :to="child.path"
            :class="['block px-4 py-2 pl-12 text-sm hover:bg-gray-800 transition-colors', isActive(child.path) ? 'text-blue-400 bg-gray-800' : 'text-gray-400']"
          >
            {{ child.label }}
          </router-link>
        </div>
      </div>
    </nav>
  </aside>
</template>
