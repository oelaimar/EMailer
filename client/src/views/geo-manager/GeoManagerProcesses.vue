<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getGeoManagerProcesses, deleteGeoManagerProcess, startGeoManagerProcess, stopGeoManagerProcess, bulkActionGeoManager } from '../../api/geoManager';

const router = useRouter();
const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'targetRows', label: 'Target Rows' },
  { key: 'batchSize', label: 'Batch Size' },
  { key: 'duplicateMode', label: 'Duplicate Mode' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Logs', class: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200', handler: (row) => router.push(`/geo-manager/${row.id}/logs`) },
  { label: 'Start', class: 'bg-green-100 text-green-700 hover:bg-green-200', handler: (row) => {
    confirmMessage.value = `Start process "${row.name}"?`;
    confirmAction.value = () => startGeoManagerProcess(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
  { label: 'Stop', class: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', handler: (row) => {
    confirmMessage.value = `Stop process "${row.name}"?`;
    confirmAction.value = () => stopGeoManagerProcess(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
  { label: 'Delete', class: 'bg-red-100 text-red-700 hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete process "${row.name}"?`;
    confirmAction.value = () => deleteGeoManagerProcess(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const groupActions = [
  { label: 'Delete', action: 'delete', class: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
];

const handleGroupAction = async ({ action, ids }) => {
  confirmMessage.value = `Delete ${ids.length} process(es)?`;
  confirmAction.value = () => bulkActionGeoManager(action, ids).then(() => tableRef.value?.loadData());
  confirmDialog.value = true;
};

const handleConfirm = async () => {
  loading.value = true;
  try { await confirmAction.value(); } catch (e) { console.error(e); }
  loading.value = false;
  confirmDialog.value = false;
};

const statusColor = (s) => {
  if (s === 'Running') return 'bg-emerald-100 text-emerald-700';
  if (s === 'Stopped') return 'bg-red-100 text-red-700';
  if (s === 'Completed') return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-600';
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Geo Manager</h1>
      <router-link to="/geo-manager/add" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        + Add New Process
      </router-link>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getGeoManagerProcesses(params)).data"
      :selectable="true"
      :actions="actions"
      :group-actions="groupActions"
      @group-action="handleGroupAction"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusColor(value)]">{{ value }}</span>
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(value).toLocaleDateString() }}
      </template>
    </DataTable>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
