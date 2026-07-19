<script setup>
import { ref } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import { getPmtaCommands, createPmtaCommand } from '../../api/pmta';

const tableRef = ref(null);
const showModal = ref(false);
const loading = ref(false);
const error = ref('');
const form = ref({ serverName: '', command: '', target: '', isps: '' });

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'serverName', label: 'Server' },
  { key: 'command', label: 'Command' },
  { key: 'target', label: 'Target' },
  { key: 'isps', label: 'ISPs' },
  { key: 'status', label: 'Status' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdAt', label: 'Created' },
];

const handleCreate = async () => {
  if (!form.value.serverName.trim() || !form.value.command.trim()) return;
  loading.value = true;
  error.value = '';
  try {
    await createPmtaCommand(form.value);
    showModal.value = false;
    form.value = { serverName: '', command: '', target: '', isps: '' };
    tableRef.value?.loadData();
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to create command.';
  } finally {
    loading.value = false;
  }
};

const statusColor = (s) => {
  if (s === 'Completed') return 'bg-emerald-100 text-emerald-700';
  if (s === 'Running') return 'bg-blue-100 text-blue-700';
  if (s === 'Failed') return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">PMTA Commands</h1>
      <button @click="showModal = true" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        + Send Command
      </button>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getPmtaCommands(params)).data"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusColor(value)]">{{ value }}</span>
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(value).toLocaleString() }}
      </template>
    </DataTable>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Send PMTA Command</h3>
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Server Name *</label>
            <input v-model="form.serverName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="pmta-server-1" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Command *</label>
            <select v-model="form.command" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select command...</option>
              <option value="start">Start</option>
              <option value="stop">Stop</option>
              <option value="restart">Restart</option>
              <option value="reload">Reload Config</option>
              <option value="show queue">Show Queue</option>
              <option value="show status">Show Status</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Target</label>
            <input v-model="form.target" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Optional target" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ISPs</label>
            <input v-model="form.isps" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Comma-separated ISP names" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showModal = false; error = ''" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">Cancel</button>
          <button @click="handleCreate" :disabled="loading || !form.serverName.trim() || !form.command" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Sending...' : 'Send Command' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
