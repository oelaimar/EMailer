<script setup>
import { ref, onMounted, computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent, DataZoomComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { getAdvancedReport } from '../../api/statistics';
import PageHeader from '../../components/common/PageHeader.vue';

use([CanvasRenderer, BarChart, LineChart, PieChart, ScatterChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DataZoomComponent]);

const loading = ref(false);
const error = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const stats = ref(null);
const processes = ref([]);

const handleSearch = async () => {
  loading.value = true; error.value = ''; stats.value = null; processes.value = [];
  try {
    const params = {};
    if (dateFrom.value) params.dateFrom = dateFrom.value;
    if (dateTo.value) params.dateTo = dateTo.value;
    const { data } = await getAdvancedReport(params);
    stats.value = data.stats || null;
    processes.value = data.processes || [];
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to load report.';
  } finally { loading.value = false; }
};

const kpis = computed(() => {
  if (!stats.value) return [];
  const s = stats.value;
  return [
    { label: 'Total Processes', value: s.totalProcesses?.toLocaleString() || 0, color: 'blue' },
    { label: 'Total Sent', value: s.totalSent?.toLocaleString() || 0, color: 'emerald' },
    { label: 'Total Earnings', value: '$' + (s.totalEarnings?.toLocaleString() || '0.00'), color: 'purple' },
    { label: 'Unique MTA Servers', value: Object.keys(s.byMtaServer || {}).length, color: 'amber' },
    { label: 'Unique Offers', value: Object.keys(s.byOffer || {}).length, color: 'rose' },
    { label: 'Unique SMTP Groups', value: Object.keys(s.bySmtpGroup || {}).length, color: 'cyan' },
  ];
});

const statusChartOption = computed(() => {
  if (!stats.value?.byStatus) return {};
  const data = Object.entries(stats.value.byStatus).map(([name, value]) => ({ name, value }));
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{ type: 'pie', radius: ['40%', '70%'], data, emphasis: { itemStyle: { shadowBlur: 10 } } }],
  };
});

const dayChartOption = computed(() => {
  if (!stats.value?.byDay) return {};
  const days = Object.keys(stats.value.byDay).sort();
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: days.map((d) => d.slice(5)) },
    yAxis: [
      { type: 'value', name: 'Sent' },
      { type: 'value', name: 'Earnings ($)', position: 'right' },
    ],
    series: [
      { name: 'Sent', type: 'bar', data: days.map((d) => stats.value.byDay[d].sent), itemStyle: { color: '#3b82f6' } },
      { name: 'Earnings', type: 'line', yAxisIndex: 1, data: days.map((d) => parseFloat(stats.value.byDay[d].earnings.toFixed(2))), itemStyle: { color: '#10b981' } },
    ],
  };
});

const mtaChartOption = computed(() => {
  if (!stats.value?.byMtaServer) return {};
  const entries = Object.entries(stats.value.byMtaServer).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: entries.map(([n]) => n.length > 12 ? n.slice(0, 12) + '...' : n), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: entries.map(([, v]) => v), itemStyle: { color: '#8b5cf6' } }],
  };
});

const offerChartOption = computed(() => {
  if (!stats.value?.byOffer) return {};
  const data = Object.entries(stats.value.byOffer).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  return {
    tooltip: { trigger: 'item', formatter: '{b}: ${c}' },
    series: [{ type: 'pie', radius: '65%', data }],
  };
});

const hourlyChartOption = computed(() => {
  if (!stats.value?.byHour) return {};
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: hours.map((h) => h + ':00') },
    yAxis: { type: 'value', name: 'Avg Sent' },
    series: [{
      type: 'bar',
      data: hours.map((h) => {
        const d = stats.value.byHour[h];
        return d ? Math.round(d.sent / d.count) : 0;
      }),
      itemStyle: { color: '#f59e0b' },
    }],
  };
});

const smtpChartOption = computed(() => {
  if (!stats.value?.bySmtpGroup) return {};
  const entries = Object.entries(stats.value.bySmtpGroup).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: entries.map(([n]) => n.length > 12 ? n.slice(0, 12) + '...' : n), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: entries.map(([, v]) => v), itemStyle: { color: '#06b6d4' } }],
  };
});

const earningsScatterOption = computed(() => {
  if (!processes.value.length) return {};
  const data = processes.value.map((p) => [p.speed || 0, Math.round((p.speed || 0) * 100 * (p.offer?.payout || 0) / 1000)]).filter((d) => d[1] > 0);
  return {
    tooltip: { trigger: 'item', formatter: (p) => `Speed: ${p.data[0]}<br/>Earnings: $${p.data[1]}` },
    xAxis: { name: 'Speed' },
    yAxis: { name: 'Earnings ($)' },
    series: [{ type: 'scatter', data, symbolSize: 10, itemStyle: { color: '#ec4899' } }],
  };
});

const statusColor = (s) => {
  if (s === 'Running') return 'bg-primary-light text-primary';
  if (s === 'Completed') return 'bg-success-light text-success';
  if (s === 'Failed') return 'bg-danger-light text-danger';
  return 'bg-surface-alt text-muted';
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="Advanced Analytics Dashboard" />
    </div>

    <div class="bg-surface rounded-xl border border-border p-4 mb-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Date From</label>
          <input v-model="dateFrom" type="date" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Date To</label>
          <input v-model="dateTo" type="date" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div class="flex items-end">
          <button @click="handleSearch" :disabled="loading" class="w-full px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Loading...' : 'Generate Dashboard' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="stats" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div v-for="kpi in kpis" :key="kpi.label" class="bg-surface rounded-xl border border-border p-4">
          <div class="text-xs text-muted mb-1">{{ kpi.label }}</div>
          <div class="text-xl font-bold text-fg">{{ kpi.value }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-surface rounded-xl border border-border p-4">
          <h3 class="text-sm font-semibold text-fg-secondary mb-2">By Status</h3>
          <v-chart :option="statusChartOption" style="height: 280px" autoresize />
        </div>
        <div class="bg-surface rounded-xl border border-border p-4">
          <h3 class="text-sm font-semibold text-fg-secondary mb-2">Daily Sent & Earnings</h3>
          <v-chart :option="dayChartOption" style="height: 280px" autoresize />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-surface rounded-xl border border-border p-4">
          <h3 class="text-sm font-semibold text-fg-secondary mb-2">Top MTA Servers</h3>
          <v-chart :option="mtaChartOption" style="height: 280px" autoresize />
        </div>
        <div class="bg-surface rounded-xl border border-border p-4">
          <h3 class="text-sm font-semibold text-fg-secondary mb-2">Earnings by Offer</h3>
          <v-chart :option="offerChartOption" style="height: 280px" autoresize />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-surface rounded-xl border border-border p-4">
          <h3 class="text-sm font-semibold text-fg-secondary mb-2">Hourly Distribution</h3>
          <v-chart :option="hourlyChartOption" style="height: 280px" autoresize />
        </div>
        <div class="bg-surface rounded-xl border border-border p-4">
          <h3 class="text-sm font-semibold text-fg-secondary mb-2">Top SMTP Groups</h3>
          <v-chart :option="smtpChartOption" style="height: 280px" autoresize />
        </div>
      </div>

      <div class="bg-surface rounded-xl border border-border p-4">
        <h3 class="text-sm font-semibold text-fg-secondary mb-2">Speed vs Earnings Scatter</h3>
        <v-chart :option="earningsScatterOption" style="height: 320px" autoresize />
      </div>

      <div v-if="processes.length" class="bg-surface rounded-xl border border-border overflow-hidden">
        <div class="px-4 py-3 bg-surface-alt border-b border-border font-medium text-fg-secondary text-sm">Recent Processes ({{ processes.length }})</div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b border-border">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-muted">ID</th>
                <th class="px-4 py-3 text-left font-medium text-muted">Process</th>
                <th class="px-4 py-3 text-left font-medium text-muted">Production</th>
                <th class="px-4 py-3 text-left font-medium text-muted">MTA</th>
                <th class="px-4 py-3 text-left font-medium text-muted">Offer</th>
                <th class="px-4 py-3 text-left font-medium text-muted">Status</th>
                <th class="px-4 py-3 text-left font-medium text-muted">Speed</th>
                <th class="px-4 py-3 text-left font-medium text-muted">Created</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="p in processes.slice(0, 50)" :key="p.id" class="hover:bg-surface-alt">
                <td class="px-4 py-3 text-fg">{{ p.id }}</td>
                <td class="px-4 py-3 text-fg">{{ p.processName }}</td>
                <td class="px-4 py-3 text-muted">{{ p.production?.name || '-' }}</td>
                <td class="px-4 py-3 text-muted">{{ p.mtaServer?.name || '-' }}</td>
                <td class="px-4 py-3 text-muted">{{ p.offer?.name || '-' }}</td>
                <td class="px-4 py-3">
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusColor(p.status)]">{{ p.status }}</span>
                </td>
                <td class="px-4 py-3 text-fg">{{ p.speed || 0 }}</td>
                <td class="px-4 py-3 text-muted">{{ new Date(p.createdAt).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>