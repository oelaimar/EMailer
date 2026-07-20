<script setup>
import { ref } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getPmtaSchedules, createPmtaSchedule, stopPmtaSchedule, deletePmtaSchedule } from '../../api/pmta';
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();

const tableRef = ref(null);
const showModal = ref(false);
const loading = ref(false);
const error = ref('');
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const form = ref({ serverName: '', command: '', delay: 0, delayUnit: 'seconds' });

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'serverName', label: 'Server' },
  { key: 'command', label: 'Command' },
  { key: 'delay', label: 'Delay' },
  { key: 'delayUnit', label: 'Unit' },
  { key: 'status', label: 'Status' },
  { key: 'startTime', label: 'Start Time' },
  { key: 'finishTime', label: 'Finish Time' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Stop', class: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', handler: (row) => {
    confirmMessage.value = `Stop schedule #${row.id}?`;
    confirmAction.value = () => stopPmtaSchedule(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
  { label: 'Delete', class: 'bg-red-100 text-red-700 hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete schedule #${row.id}?`;
    confirmAction.value = () => deletePmtaSchedule(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const handleCreate = async () => {
  if (!form.value.serverName.trim() || !form.value.command.trim()) return;
  loading.value = true;
  error.value = '';
  try {
    await createPmtaSchedule(form.value);
    showModal.value = false;
    form.value = { serverName: '', command: '', delay: 0, delayUnit: 'seconds' };
    tableRef.value?.loadData();
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to create schedule.';
  } finally {
    loading.value = false;
  }
};

const handleConfirm = async () => {
  loading.value = true;
  try { await confirmAction.value(); } catch (e) { toastStore.showToast('Action failed', 'error'); }
  loading.value = false;
  confirmDialog.value = false;
};

const statusColor = (s) => {
  if (s === 'Completed') return 'bg-emerald-100 text-emerald-700';
  if (s === 'Running') return 'bg-blue-100 text-blue-700';
  if (s === 'Stopped') return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">PMTA Scheduler</h1>
      <button @click="showModal = true" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        + Add Schedule
      </button>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getPmtaSchedules(params)).data"
      :actions="actions"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusColor(value)]">{{ value }}</span>
      </template>
      <template #cell-startTime="{ value }">
        {{ value ? new Date(value).toLocaleString() : '-' }}
      </template>
      <template #cell-finishTime="{ value }">
        {{ value ? new Date(value).toLocaleString() : '-' }}
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(value).toLocaleString() }}
      </template>
    </DataTable>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Add Scheduled Command</h3>
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Server Name *</label>
            <input v-model="form.serverName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Command *</label>
            <select v-model="form.command" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select command...</option>
              <option value="start">Start</option>
              <option value="stop">Stop</option>
              <option value="restart">Restart</option>
              <option value="reload">Reload Config</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Delay</label>
              <input v-model="form.delay" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select v-model="form.delayUnit" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showModal = false; error = ''" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">Cancel</button>
          <button @click="handleCreate" :disabled="loading || !form.serverName.trim() || !form.command" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Creating...' : 'Create Schedule' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
