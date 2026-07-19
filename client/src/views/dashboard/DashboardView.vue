<script setup>
import { ref, onMounted, computed } from 'vue';
import { getDashboardStats, getDashboardCharts } from '../../api/dashboard';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const stats = ref({});
const charts = ref({ sentStats: [], actionsStats: [], dailyEarnings: [], monthlyEarnings: [] });
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

const sentVsCompletedData = computed(() => {
  const labels = charts.value.sentStats.map(d => {
    const dt = new Date(d.date + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  return {
    labels,
    datasets: [
      {
        label: 'Sent',
        data: charts.value.sentStats.map(d => d.value),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Completed',
        data: charts.value.actionsStats.map(d => d.value),
        backgroundColor: 'rgba(16,185,129,0.7)',
        borderColor: 'rgba(16,185,129,1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };
});

const sentVsCompletedOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
};

const dailyEarningsData = computed(() => {
  const labels = charts.value.dailyEarnings.map(d => {
    const dt = new Date(d.date + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  return {
    labels,
    datasets: [
      {
        label: 'Earnings ($)',
        data: charts.value.dailyEarnings.map(d => parseFloat(d.value)),
        backgroundColor: 'rgba(16,185,129,0.7)',
        borderColor: 'rgba(16,185,129,1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };
});

const dailyEarningsOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' } },
  scales: { y: { beginAtZero: true } },
};

const totalMonthlyEarnings = computed(() => {
  if (!charts.value.monthlyEarnings.length) return '0.00';
  return charts.value.monthlyEarnings[0].value;
});

const completionRate = computed(() => {
  const sent = charts.value.sentStats.reduce((s, d) => s + d.value, 0);
  const completed = charts.value.actionsStats.reduce((s, d) => s + d.value, 0);
  if (sent === 0) return 0;
  return Math.round((completed / sent) * 100);
});

const completionData = computed(() => {
  const rate = completionRate.value;
  return {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [rate, 100 - rate],
        backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(229,231,235,0.8)'],
        borderColor: ['rgba(16,185,129,1)', 'rgba(229,231,235,1)'],
        borderWidth: 1,
      },
    ],
  };
});

const completionOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.parsed}%`,
      },
    },
  },
  cutout: '65%',
};

onMounted(async () => {
  try {
    const [statsRes, chartsRes] = await Promise.all([
      getDashboardStats(),
      getDashboardCharts(),
    ]);
    stats.value = statsRes.data;
    charts.value = chartsRes.data;
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
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Sent vs Completed (7 Days)</h3>
        <div class="h-60">
          <Bar v-if="charts.sentStats.length" :data="sentVsCompletedData" :options="sentVsCompletedOpts" />
          <div v-else class="h-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Daily Earnings (This Month)</h3>
        <div class="h-60">
          <Bar v-if="charts.dailyEarnings.length" :data="dailyEarningsData" :options="dailyEarningsOpts" />
          <div v-else class="h-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Completion Rate (7 Days)</h3>
        <div class="h-60 relative">
          <Doughnut :data="completionData" :options="completionOpts" />
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span class="text-3xl font-bold text-gray-800">{{ completionRate }}%</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Earnings For This Month</h3>
        <div class="h-60 flex flex-col items-center justify-center">
          <span class="text-5xl font-bold text-emerald-600">${{ totalMonthlyEarnings }}</span>
          <p class="text-sm text-gray-500 mt-2">Total earnings this month</p>
        </div>
      </div>
    </div>
  </div>
</template>
