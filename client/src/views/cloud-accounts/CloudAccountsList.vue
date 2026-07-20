<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getCloudAccounts, deleteCloudAccount, bulkActionCloudAccounts } from '../../api/cloudAccounts';
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();

const router = useRouter();
const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);

const providerLabels = {
  aws: 'Amazon AWS', azure: 'Azure', do: 'Digital Ocean',
  hetzner: 'Hetzner', linode: 'Linode', ovh: 'OVH',
  scaleway: 'Scaleway', vultr: 'Vultr', atlantic: 'Atlantic',
  idcloud: 'IDCloud Host', google: 'Google Cloud',
};

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'provider', label: 'Provider', format: (v) => providerLabels[v] || v },
  { key: 'name', label: 'Account Name' },
  { key: 'status', label: 'Status' },
  { key: '_count', label: 'Instances', format: (v) => v?.instances || 0 },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Edit', class: 'bg-blue-100 text-blue-700 hover:bg-blue-200', handler: (row) => router.push(`/cloud-accounts/${row.id}/edit`) },
  { label: 'Delete', class: 'bg-red-100 text-red-700 hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete cloud account "${row.name}"?`;
    confirmAction.value = () => deleteCloudAccount(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const groupActions = [
  { label: 'Activate', action: 'activate', class: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
  { label: 'Inactivate', action: 'inactivate', class: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
  { label: 'Delete', action: 'delete', class: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
];

const handleGroupAction = async ({ action, ids }) => {
  confirmMessage.value = `${action} ${ids.length} cloud account(s)?`;
  confirmAction.value = () => bulkActionCloudAccounts(action, ids).then(() => tableRef.value?.loadData());
  confirmDialog.value = true;
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
      <h1 class="text-2xl font-bold text-gray-800">Cloud Accounts</h1>
      <router-link to="/cloud-accounts/add" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        + Add New Account
      </router-link>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getCloudAccounts(params)).data"
      :selectable="true"
      :actions="actions"
      :group-actions="groupActions"
      @group-action="handleGroupAction"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Activated' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600']">
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
