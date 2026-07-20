<script setup>
import { ref, onMounted, computed } from 'vue';
import { getDashboardStats, getDashboardCharts } from '../../api/dashboard';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useToastStore } from '../../stores/toast';

use([BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const toastStore = useToastStore();
const stats = ref({});
const charts = ref({ sentStats: [], actionsStats: [], dailyEarnings: [], monthlyEarnings: [] });
const loading = ref(true);

const statCards = [
  { key: 'activeServers', label: 'Active SMTP Servers', iconColor: 'bg-blue-500/10 text-stat-blue', iconPath: 'M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h10v2H4v-2z' },
  { key: 'totalMtaServers', label: 'MTA Servers', iconColor: 'bg-blue-500/10 text-stat-blue', iconPath: 'M4 4h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 12h16v2H4v-2zm4 4h8v1H8v-1z' },
  { key: 'activeOffers', label: 'Active Offers', iconColor: 'bg-emerald-500/10 text-stat-emerald', iconPath: 'M7 18a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM5.2 4.2l-.9 2H2v1h1.5l2.6 7.6-.4 1A2 2 0 007.6 17h9.8v-1H7.6l.6-2h7.2a2 2 0 001.9-1.4l2.5-6.2A1 1 0 0019 5H6.2l-.6-1.4L5.2 4.2z' },
  { key: 'activeIPs', label: 'Active IPs', iconColor: 'bg-cyan-500/10 text-stat-cyan', iconPath: 'M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h16v2H4v-2z' },
  { key: 'totalDomains', label: 'Domains', iconColor: 'bg-emerald-500/10 text-stat-emerald', iconPath: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm0-14a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4.5 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-9 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4.5 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z' },
  { key: 'totalMailboxes', label: 'Mailboxes', iconColor: 'bg-orange-500/10 text-stat-orange', iconPath: 'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2l8 5 8-5H4zm0 12h16V8l-8 5-8-5v10z' },
  { key: 'totalDataLists', label: 'Data Lists', iconColor: 'bg-violet-500/10 text-stat-violet', iconPath: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z' },
  { key: 'totalUsers', label: 'Users', iconColor: 'bg-rose-500/10 text-stat-rose', iconPath: 'M16 11a4 4 0 10-8 0 4 4 0 008 0zm-4 6a6 6 0 00-6 6h12a6 6 0 00-6-6zM22 7h-2V5a1 1 0 10-2 0v2h-2a1 1 0 100 2h2v2a1 1 0 102 0V9h2a1 1 0 100-2z' },
  { key: 'dailySent', label: 'Daily Sent', iconColor: 'bg-emerald-500/10 text-stat-emerald', iconPath: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' },
  { key: 'monthlyLeads', label: 'Monthly Leads', iconColor: 'bg-amber-500/10 text-stat-amber', iconPath: 'M15 12a4 4 0 10-8 0 4 4 0 008 0zm2 0a6 6 0 11-12 0 6 6 0 0112 0zm-2 6a6 6 0 00-6 6h12a6 6 0 00-6-6zM20.6 8.4a1 1 0 00-1.2-.6l-2.4 1.2-2.4-1.2a1 1 0 00-1.2.6L12 11l-1.4-2.6a1 1 0 00-1.2-.6L7 9l3.2 1.6a1 1 0 00.8 0L14 9l-1.4-2.6a1 1 0 00-1.2-.6L9 8l2.4-1.2a1 1 0 00.8 0L15 8l-1.4-2.6a1 1 0 00-1.2-.6L10 7l3.2 1.6a1 1 0 00.8 0L17 7l-1.4-2.6a1 1 0 00-1.2-.6L12 7.6' },
  { key: 'monthlyEarnings', label: 'Monthly Earnings', iconColor: 'bg-emerald-500/10 text-stat-emerald', iconPath: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 17.9V18h-1a4 4 0 110-8h2a1 1 0 100-2h-2v-1a1 1 0 10-2 0v1H9a6 6 0 100 12h1v-1.1a3.5 3.5 0 002.5-3.2c0-.7-.2-1.4-.5-2H11v-2h1.5a1.5 1.5 0 000-3H11v-2h.5a3.5 3.5 0 010 7H11v1.9zM13 8h-2v2h2V8z' },
];

const sentVsCompletedOption = computed(() => {
  const labels = charts.value.sentStats.map(d => {
    const dt = new Date(d.date + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Sent', 'Completed'] },
    grid: { left: 40, right: 16, bottom: 24, top: 36 },
    xAxis: { type: 'category', data: labels },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      { name: 'Sent', type: 'bar', data: charts.value.sentStats.map(d => d.value), itemStyle: { color: 'rgba(59,130,246,0.7)', borderRadius: [4,4,0,0] } },
      { name: 'Completed', type: 'bar', data: charts.value.actionsStats.map(d => d.value), itemStyle: { color: 'rgba(16,185,129,0.7)', borderRadius: [4,4,0,0] } },
    ],
  };
});

const dailyEarningsOption = computed(() => {
  const labels = charts.value.dailyEarnings.map(d => {
    const dt = new Date(d.date + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 16, bottom: 24, top: 16 },
    xAxis: { type: 'category', data: labels },
    yAxis: { type: 'value' },
    series: [
      { name: 'Earnings ($)', type: 'bar', data: charts.value.dailyEarnings.map(d => parseFloat(d.value)), itemStyle: { color: 'rgba(16,185,129,0.7)', borderRadius: [4,4,0,0] } },
    ],
  };
});

const completionRate = computed(() => {
  const sent = charts.value.sentStats.reduce((s, d) => s + d.value, 0);
  const completed = charts.value.actionsStats.reduce((s, d) => s + d.value, 0);
  if (sent === 0) return 0;
  return Math.round((completed / sent) * 100);
});

const completionOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
  legend: { bottom: 0 },
  series: [{
    type: 'pie',
    radius: ['50%', '70%'],
    label: { show: false },
    data: [
      { value: completionRate.value, name: 'Completed', itemStyle: { color: 'rgba(16,185,129,0.8)' } },
      { value: 100 - completionRate.value, name: 'Remaining', itemStyle: { color: 'rgba(229,231,235,0.8)' } },
    ],
  }],
}));

const totalMonthlyEarnings = computed(() => {
  if (!charts.value.monthlyEarnings.length) return '0.00';
  return charts.value.monthlyEarnings[0].value;
});

onMounted(async () => {
  try {
    const [statsRes, chartsRes] = await Promise.all([
      getDashboardStats(),
      getDashboardCharts(),
    ]);
    stats.value = statsRes.data;
    charts.value = chartsRes.data;
  } catch (e) { toastStore.showToast('Failed to load dashboard', 'error'); } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-fg">Dashboard</h1>
        <p class="text-sm text-muted mt-0.5">Welcome back</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-1.5 px-3.5 py-2 bg-surface text-fg border border-border rounded-lg text-sm font-medium hover:bg-surface-alt transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export
        </button>
        <button class="flex items-center gap-1.5 px-3.5 py-2 bg-surface text-fg border border-border rounded-lg text-sm font-medium hover:bg-surface-alt transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Last 30 days
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      <div v-for="card in statCards" :key="card.key" class="bg-surface border border-border rounded-xl p-5 transition-all hover:border-border hover:shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div :class="[card.iconColor, 'w-9 h-9 rounded-lg flex items-center justify-center']">
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="card.iconPath" /></svg>
          </div>
          <button class="text-muted hover:text-fg-secondary p-1 rounded-md hover:bg-surface-alt transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
          </button>
        </div>
        <p class="text-[1.75rem] font-semibold tracking-tight text-fg tabular-nums leading-tight">{{ stats[card.key] ?? 0 }}</p>
        <p class="text-sm text-muted mt-0.5">{{ card.label }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <div class="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold tracking-tight text-fg">Sent vs Completed</h3>
          <div class="flex items-center gap-1 bg-surface-alt rounded-lg p-0.5">
            <button class="px-3 py-1.5 text-xs font-medium rounded-md bg-surface text-fg border border-border shadow-sm">7 Days</button>
            <button class="px-3 py-1.5 text-xs font-medium rounded-md text-muted hover:text-fg">30 Days</button>
          </div>
        </div>
        <div class="h-[220px]">
          <VChart v-if="charts.sentStats.length" :option="sentVsCompletedOption" autoresize />
          <div v-else class="h-full flex items-center justify-center text-muted text-sm">No data available</div>
        </div>
      </div>

      <div class="bg-surface border border-border rounded-xl p-5">
        <h3 class="text-base font-semibold tracking-tight text-fg mb-4">Daily Earnings</h3>
        <div class="h-[220px]">
          <VChart v-if="charts.dailyEarnings.length" :option="dailyEarningsOption" autoresize />
          <div v-else class="h-full flex items-center justify-center text-muted text-sm">No data available</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-surface border border-border rounded-xl p-5">
        <h3 class="text-base font-semibold tracking-tight text-fg mb-4">Completion Rate</h3>
        <div class="h-[220px] relative">
          <VChart :option="completionOption" autoresize />
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none" style="margin-top:-24px">
            <span class="text-3xl font-bold text-fg">{{ completionRate }}%</span>
          </div>
        </div>
      </div>

      <div class="bg-surface border border-border rounded-xl p-5 flex flex-col items-center justify-center">
        <h3 class="text-base font-semibold tracking-tight text-fg mb-4 self-start">Monthly Earnings</h3>
        <span class="text-4xl font-bold tracking-tighter text-success tabular-nums">${{ totalMonthlyEarnings }}</span>
        <p class="text-sm text-muted mt-2">Total earnings this month</p>
      </div>
    </div>
  </div>
</template>
