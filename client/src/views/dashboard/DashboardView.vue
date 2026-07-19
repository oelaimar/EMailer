<script setup>
import { ref, onMounted } from 'vue';
import { getDashboardStats } from '../../api/dashboard';

const stats = ref({});
const loading = ref(true);

const statCards = [
  { key: 'activeServers', label: 'Active SMTP Servers', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '🌐' },
  { key: 'totalMtaServers', label: 'MTA Servers', color: 'text-blue-600', bg: 'bg-blue-50', icon: '🖥️' },
  { key: 'activeOffers', label: 'Active Offers', color: 'text-purple-800', bg: 'bg-purple-50', icon: '🛒' },
  { key: 'activeIPs', label: 'Active IPs', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '📋' },
  { key: 'totalDomains', label: 'Domains', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '🔗' },
  { key: 'totalMailboxes', label: 'Mailboxes', color: 'text-orange-600', bg: 'bg-orange-50', icon: '📬' },
  { key: 'totalDataLists', label: 'Data Lists', color: 'text-teal-600', bg: 'bg-teal-50', icon: '📊' },
  { key: 'totalUsers', label: 'Users', color: 'text-pink-600', bg: 'bg-pink-50', icon: '👥' },
  { key: 'dailySent', label: 'Daily Sent', color: 'text-green-700', bg: 'bg-green-50', icon: '✈️' },
  { key: 'dailyBounced', label: 'Daily Bounced', color: 'text-red-600', bg: 'bg-red-50', icon: '👎' },
  { key: 'monthlyLeads', label: 'Monthly Leads', color: 'text-purple-700', bg: 'bg-purple-50', icon: '👜' },
  { key: 'monthlyEarnings', label: 'Monthly Earnings', color: 'text-green-600', bg: 'bg-green-50', icon: '💲' },
];

onMounted(async () => {
  try {
    const { data } = await getDashboardStats();
    stats.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div v-for="card in statCards" :key="card.key" :class="['rounded-xl p-4 border', card.bg, 'border-gray-200']">
        <div class="flex items-center justify-between">
          <div>
            <p :class="['text-2xl font-bold', card.color]">{{ stats[card.key] ?? 0 }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ card.label }}</p>
          </div>
          <span class="text-2xl">{{ card.icon }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="title in ['Delivery / Bounced For This Month', 'Opens / Clicks / Leads / Unsubs For This Month', 'Earnings For This Month', 'Earnings For This Year 2026']" :key="title" class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ title }}</h3>
        <div class="h-60 flex items-center justify-center text-gray-400 text-sm">
          Chart placeholder
        </div>
      </div>
    </div>
  </div>
</template>
