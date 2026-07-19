<script setup>
import { ref, onMounted } from 'vue';
import { getMtaServers, executeServersCommand } from '../../api/mtaServers';

const loading = ref(false);
const error = ref('');
const servers = ref([]);
const selectedIds = ref([]);
const results = ref([]);

const actions = [
  { value: 'get-info', label: 'Get Servers Info', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { value: 'get-ips', label: 'Get Servers IPs', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { value: 'reboot-server', label: 'Reboot Servers', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
  { value: 'refresh-ram', label: 'Refresh RAM & Cache', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { value: 'clean-logs', label: 'Clear Logs', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
  { value: 'stop-apache', label: 'Stop Apache', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  { value: 'start-apache', label: 'Start Apache', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { value: 'restart-apache', label: 'Restart Apache', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
];

onMounted(async () => {
  try {
    const { data } = await getMtaServers({ limit: 1000, status: 'Activated' });
    servers.value = data.data || [];
  } catch { servers.value = []; }
});

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id);
  if (idx === -1) selectedIds.value.push(id);
  else selectedIds.value.splice(idx, 1);
};

const selectAll = () => { selectedIds.value = servers.value.map(s => s.id); };
const clearSelection = () => { selectedIds.value = []; };

const executeAction = async (action) => {
  if (selectedIds.value.length === 0) {
    error.value = 'Select at least one server.';
    return;
  }
  loading.value = true;
  error.value = '';
  results.value = [];
  try {
    const { data } = await executeServersCommand({ servers: selectedIds.value, action });
    results.value = data.results || [];
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to execute command.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Server Actions</h1>
      <router-link to="/mta-servers" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold">Servers ({{ selectedIds.length }} selected)</h2>
          <div class="flex gap-1">
            <button @click="selectAll" class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200">All</button>
            <button @click="clearSelection" class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200">Clear</button>
          </div>
        </div>
        <div class="max-h-64 overflow-y-auto space-y-1">
          <label v-for="s in servers" :key="s.id" :class="['flex items-center gap-2 p-2 rounded text-sm cursor-pointer', selectedIds.includes(s.id) ? 'bg-blue-50 border border-blue-300' : 'hover:bg-gray-50 border border-transparent']">
            <input type="checkbox" :checked="selectedIds.includes(s.id)" @change="toggleSelect(s.id)" class="rounded" />
            <div>
              <div class="font-medium text-xs">{{ s.name }}</div>
              <div class="text-gray-500 text-xs">{{ s.mainIp }}</div>
            </div>
          </label>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-sm font-semibold mb-3">Actions</h2>
        <div class="grid grid-cols-2 gap-2">
          <button v-for="a in actions" :key="a.value" @click="executeAction(a.value)" :disabled="loading || selectedIds.length === 0" :class="[a.color, 'px-3 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50']">
            {{ a.label }}
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-sm font-semibold mb-3">Results</h2>
        <div class="max-h-96 overflow-y-auto space-y-3">
          <div v-for="r in results" :key="r.id" class="border border-gray-200 rounded-lg p-3">
            <div class="text-xs font-semibold text-gray-700 mb-1">{{ r.name }}</div>
            <pre class="text-xs text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-wrap">{{ r.output }}</pre>
          </div>
          <div v-if="results.length === 0" class="text-sm text-gray-400 text-center py-8">No results yet. Select servers and execute an action.</div>
        </div>
      </div>
    </div>
  </div>
</template>
