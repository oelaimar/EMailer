<script setup>
import { ref } from 'vue';
import { getAdvancedReport } from '../../api/statistics';
import PageHeader from '../../components/common/PageHeader.vue';

const loading = ref(false);
const error = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const stats = ref(null);
const processes = ref([]);

const handleSearch = async () => {
  loading.value = true;
  error.value = '';
  stats.value = null;
  processes.value = [];
  try {
    const params = {};
    if (dateFrom.value) params.dateFrom = dateFrom.value;
    if (dateTo.value) params.dateTo = dateTo.value;
    const { data } = await getAdvancedReport(params);
    stats.value = data.stats || null;
    processes.value = data.processes || [];
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to load report.';
  } finally {
    loading.value = false;
  }
};

const statusColor = (s) => {
  if (s === 'Running') return 'bg-emerald-100 text-emerald-700';
  if (s === 'Completed') return 'bg-blue-100 text-blue-700';
  if (s === 'Failed') return 'bg-red-100 text-red-700';
  return 'bg-surface-alt text-muted';
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="Advanced Statistics" />
    </div>

    <div class="bg-surface rounded-xl border border-border p-4 mb-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Date From</label>
          <input v-model="dateFrom" type="date" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Date To</label>
          <input v-model="dateTo" type="date" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
        </div>
        <div class="flex items-end">
          <button @click="handleSearch" :disabled="loading" class="w-full px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary-muted text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Loading...' : 'Generate Report' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-surface rounded-xl border border-border p-4">
        <div class="text-sm text-muted">Total Processes</div>
        <div class="text-2xl font-bold text-fg">{{ stats.totalProcesses }}</div>
      </div>
      <div class="bg-surface rounded-xl border border-border p-4">
        <div class="text-sm text-muted">Total Speed</div>
        <div class="text-2xl font-bold text-fg">{{ stats.totalSent?.toLocaleString() }}</div>
      </div>
      <div class="bg-surface rounded-xl border border-border p-4">
        <div class="text-sm text-muted mb-2">By Status</div>
        <div class="flex flex-wrap gap-2">
          <span v-for="(count, status) in stats.byStatus" :key="status" :class="['px-2 py-1 text-xs font-medium rounded-full', statusColor(status)]">
            {{ status }}: {{ count }}
          </span>
          <span v-if="Object.keys(stats.byStatus).length === 0" class="text-sm text-muted">No data</span>
        </div>
      </div>
    </div>

    <div v-if="stats && Object.keys(stats.byMtaServer).length" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-surface rounded-xl border border-border p-4">
        <div class="text-sm font-medium text-fg-secondary mb-3">By MTA Server</div>
        <div class="space-y-2">
          <div v-for="(speed, name) in stats.byMtaServer" :key="name" class="flex items-center justify-between text-sm">
            <span class="text-fg-secondary">{{ name }}</span>
            <span class="font-medium text-fg">{{ speed.toLocaleString() }}</span>
          </div>
        </div>
      </div>
      <div class="bg-surface rounded-xl border border-border p-4">
        <div class="text-sm font-medium text-fg-secondary mb-3">By Offer</div>
        <div class="space-y-2">
          <div v-for="(speed, name) in stats.byOffer" :key="name" class="flex items-center justify-between text-sm">
            <span class="text-fg-secondary">{{ name }}</span>
            <span class="font-medium text-fg">{{ speed.toLocaleString() }}</span>
          </div>
          <span v-if="Object.keys(stats.byOffer).length === 0" class="text-sm text-muted">No data</span>
        </div>
      </div>
    </div>

    <div v-if="processes.length" class="bg-surface rounded-xl border border-border overflow-hidden">
      <div class="px-4 py-3 bg-surface-alt border-b border-border font-medium text-fg-secondary text-sm">Recent Processes ({{ processes.length }})</div>
      <table class="w-full text-sm">
        <thead class="border-b border-border">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-muted">ID</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Process</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Production</th>
            <th class="px-4 py-3 text-left font-medium text-muted">MTA</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Status</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Speed</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Created</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="p in processes" :key="p.id" class="hover:bg-surface-alt">
            <td class="px-4 py-3 text-fg">{{ p.id }}</td>
            <td class="px-4 py-3 text-fg">{{ p.processName }}</td>
            <td class="px-4 py-3 text-muted">{{ p.production?.name || '-' }}</td>
            <td class="px-4 py-3 text-muted">{{ p.mtaServer?.name || '-' }}</td>
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
</template>
