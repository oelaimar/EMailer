<script setup>
import { ref } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getPmtaVmtas, createPmtaVmta, deletePmtaVmta } from '../../api/pmta';
import { useToastStore } from '../../stores/toast';
import PageHeader from '../../components/common/PageHeader.vue';
const toastStore = useToastStore();

const tableRef = ref(null);
const showModal = ref(false);
const loading = ref(false);
const error = ref('');
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);

const activeTab = ref('global');
const tabs = [
  { key: 'global', label: 'Global VMTAs' },
  { key: 'individual', label: 'Individual VMTAs' },
  { key: 'smtp', label: 'SMTP VMTAs' },
  { key: 'route', label: 'Route VMTAs' },
];

const form = ref({ serverName: '', vmtaType: 'global', configData: '{}' });

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'serverName', label: 'Server' },
  { key: 'vmtaType', label: 'Type' },
  { key: 'configData', label: 'Config' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdAt', label: 'Created' },
];

const fetchVmtas = async (params) => {
  const query = { ...params, vmtaType: activeTab.value };
  const { data } = await getPmtaVmtas(query);
  return { data: Array.isArray(data) ? data : data.data || [], total: Array.isArray(data) ? data.length : data.total || 0, page: params.page || 1, limit: params.limit || 25 };
};

const switchTab = (tab) => {
  activeTab.value = tab;
  tableRef.value?.loadData();
};

const handleCreate = async () => {
  if (!form.value.serverName.trim()) return;
  loading.value = true;
  error.value = '';
  try {
    let configData = {};
    try { configData = JSON.parse(form.value.configData); } catch { configData = {}; }
    await createPmtaVmta({ ...form.value, vmtaType: activeTab.value, configData });
    showModal.value = false;
    form.value = { serverName: '', vmtaType: activeTab.value, configData: '{}' };
    tableRef.value?.loadData();
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to create VMTA.';
  } finally {
    loading.value = false;
  }
};

const handleDelete = (row) => {
  confirmMessage.value = `Delete VMTA #${row.id} (${row.serverName})?`;
  confirmAction.value = () => deletePmtaVmta(row.id).then(() => tableRef.value?.loadData());
  confirmDialog.value = true;
};

const handleConfirm = async () => {
  loading.value = true;
  try { await confirmAction.value(); } catch (e) { toastStore.showToast('Action failed', 'error'); }
  loading.value = false;
  confirmDialog.value = false;
};

const typeColor = (t) => {
  if (t === 'global') return 'bg-purple-100 text-purple-700';
  if (t === 'individual') return 'bg-blue-100 text-blue-700';
  if (t === 'smtp') return 'bg-success-light text-success';
  return 'bg-orange-100 text-orange-700';
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="PMTA VMTAs" />
      <button @click="showModal = true; form.serverName = ''; form.configData = '{}'" class="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors">
        + Add VMTA
      </button>
    </div>

    <div class="flex border-b border-border mb-6">
      <button
        v-for="tab in tabs" :key="tab.key"
        @click="switchTab(tab.key)"
        :class="['px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px', activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-fg-secondary']"
      >
        {{ tab.label }}
      </button>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchVmtas"
      :key="activeTab"
    >
      <template #cell-vmtaType="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', typeColor(value)]">{{ value }}</span>
      </template>
      <template #cell-configData="{ value }">
        <span class="text-xs font-mono text-muted truncate block max-w-[200px]" :title="typeof value === 'object' ? JSON.stringify(value) : value">{{ typeof value === 'object' ? JSON.stringify(value) : value }}</span>
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(value).toLocaleDateString() }}
      </template>
      <template #cell-actions="{ row }">
        <button @click="handleDelete(row)" class="px-2 py-1 bg-danger-light text-danger text-xs font-medium rounded hover:bg-red-200 transition-colors">Delete</button>
      </template>
    </DataTable>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-surface rounded-xl border border-border p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-semibold text-fg mb-4">Add {{ tabs.find(t => t.key === activeTab)?.label }}</h3>
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Server Name *</label>
            <input v-model="form.serverName" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" placeholder="pmta-server-1" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Config Data (JSON)</label>
            <textarea v-model="form.configData" rows="6" class="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:border-primary outline-none" placeholder='{"key": "value"}'></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showModal = false; error = ''" class="px-4 py-2 bg-surface-alt hover:bg-surface-alt text-fg-secondary text-sm font-medium rounded-lg transition-colors">Cancel</button>
          <button @click="handleCreate" :disabled="loading || !form.serverName.trim()" class="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Creating...' : 'Create VMTA' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Delete" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
