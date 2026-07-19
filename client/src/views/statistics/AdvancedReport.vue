<script setup>
import { ref } from 'vue';
import { getAdvancedReport } from '../../api/statistics';

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
  return 'bg-gray-100 text-gray-600';
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Advanced Statistics</h1>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
          <input v-model="dateFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
          <input v-model="dateTo" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div class="flex items-end">
          <button @click="handleSearch" :disabled="loading" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Loading...' : 'Generate Report' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-sm text-gray-500">Total Processes</div>
        <div class="text-2xl font-bold text-gray-800">{{ stats.totalProcesses }}</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-sm text-gray-500">Total Speed</div>
        <div class="text-2xl font-bold text-gray-800">{{ stats.totalSent?.toLocaleString() }}</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-sm text-gray-500 mb-2">By Status</div>
        <div class="flex flex-wrap gap-2">
          <span v-for="(count, status) in stats.byStatus" :key="status" :class="['px-2 py-1 text-xs font-medium rounded-full', statusColor(status)]">
            {{ status }}: {{ count }}
          </span>
          <span v-if="Object.keys(stats.byStatus).length === 0" class="text-sm text-gray-400">No data</span>
        </div>
      </div>
    </div>

    <div v-if="stats && Object.keys(stats.byMtaServer).length" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-sm font-medium text-gray-700 mb-3">By MTA Server</div>
        <div class="space-y-2">
          <div v-for="(speed, name) in stats.byMtaServer" :key="name" class="flex items-center justify-between text-sm">
            <span class="text-gray-700">{{ name }}</span>
            <span class="font-medium text-gray-800">{{ speed.toLocaleString() }}</span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-sm font-medium text-gray-700 mb-3">By Offer</div>
        <div class="space-y-2">
          <div v-for="(speed, name) in stats.byOffer" :key="name" class="flex items-center justify-between text-sm">
            <span class="text-gray-700">{{ name }}</span>
            <span class="font-medium text-gray-800">{{ speed.toLocaleString() }}</span>
          </div>
          <span v-if="Object.keys(stats.byOffer).length === 0" class="text-sm text-gray-400">No data</span>
        </div>
      </div>
    </div>

    <div v-if="processes.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-sm">Recent Processes ({{ processes.length }})</div>
      <table class="w-full text-sm">
        <thead class="border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-600">ID</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Process</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Production</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">MTA</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Speed</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Created</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="p in processes" :key="p.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-800">{{ p.id }}</td>
            <td class="px-4 py-3 text-gray-800">{{ p.processName }}</td>
            <td class="px-4 py-3 text-gray-600">{{ p.production?.name || '-' }}</td>
            <td class="px-4 py-3 text-gray-600">{{ p.mtaServer?.name || '-' }}</td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusColor(p.status)]">{{ p.status }}</span>
            </td>
            <td class="px-4 py-3 text-gray-800">{{ p.speed || 0 }}</td>
            <td class="px-4 py-3 text-gray-500">{{ new Date(p.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
