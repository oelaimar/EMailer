<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getVirtualListProcesses, deleteVirtualListProcess, startVirtualListProcess, stopVirtualListProcess, bulkActionVirtualListProcesses } from '../../api/virtualListProcesses';
import { getVirtualLists } from '../../api/virtualLists';
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();

const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);
const showForm = ref(false);
const virtualLists = ref([]);

const form = ref({ virtualListId: '', processName: '' });

onMounted(async () => {
  try {
    const { data } = await getVirtualLists({ limit: 1000 });
    virtualLists.value = data.data || [];
  } catch (e) { /* ignore */ }
});

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'processName', label: 'Process Name' },
  { key: 'virtualList', label: 'Virtual List', format: (v) => v?.name || '-' },
  { key: 'status', label: 'Status' },
  { key: 'totalEmails', label: 'Total' },
  { key: 'processedEmails', label: 'Processed' },
  { key: 'filteredEmails', label: 'Filtered' },
  { key: 'errorCount', label: 'Errors' },
  { key: 'startedAt', label: 'Started', format: (v) => v ? new Date(v).toLocaleString() : '-' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Start', class: 'bg-green-100 text-green-700 hover:bg-green-200', handler: (row) => {
    confirmMessage.value = `Start process "${row.processName}"?`;
    confirmAction.value = () => startVirtualListProcess(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
  { label: 'Stop', class: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', handler: (row) => {
    confirmMessage.value = `Stop process "${row.processName}"?`;
    confirmAction.value = () => stopVirtualListProcess(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
  { label: 'Delete', class: 'bg-red-100 text-red-700 hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete process "${row.processName}"?`;
    confirmAction.value = () => deleteVirtualListProcess(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const groupActions = [
  { label: 'Stop', action: 'stop', class: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
  { label: 'Delete', action: 'delete', class: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
];

const handleGroupAction = async ({ action, ids }) => {
  confirmMessage.value = `${action} ${ids.length} process(es)?`;
  confirmAction.value = () => bulkActionVirtualListProcesses(action, ids).then(() => tableRef.value?.loadData());
  confirmDialog.value = true;
};

const handleAdd = async () => {
  if (!form.value.processName || !form.value.virtualListId) return;
  loading.value = true;
  try {
    await createVirtualListProcess(form.value);
    form.value = { virtualListId: '', processName: '' };
    showForm.value = false;
    tableRef.value?.loadData();
  } catch (e) { toastStore.showToast('Action failed', 'error'); }
  finally { loading.value = false; }
};

const handleConfirm = async () => {
  loading.value = true;
  try { await confirmAction.value(); } catch (e) { toastStore.showToast('Action failed', 'error'); }
  loading.value = false;
  confirmDialog.value = false;
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Virtual List Processes</h1>
      <button @click="showForm = !showForm" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        {{ showForm ? 'Cancel' : '+ New Process' }}
      </button>
    </div>

    <div v-if="showForm" class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">New Process</h2>
      <form @submit.prevent="handleAdd" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Virtual List *</label>
          <select v-model="form.virtualListId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Select...</option>
            <option v-for="vl in virtualLists" :key="vl.id" :value="vl.id">{{ vl.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Process Name *</label>
          <input v-model="form.processName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div class="flex items-end">
          <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </form>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getVirtualListProcesses(params)).data"
      :selectable="true"
      :actions="actions"
      :group-actions="groupActions"
      @group-action="handleGroupAction"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full',
          value === 'Running' ? 'bg-blue-100 text-blue-700' :
          value === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
          value === 'Failed' ? 'bg-red-100 text-red-700' :
          value === 'Stopped' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-600']">
          {{ value }}
        </span>
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(value).toLocaleDateString() }}
      </template>
    </DataTable>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
