<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getOutlookAccounts, deleteOutlookAccount, bulkActionOutlookAccounts } from '../../api/outlookAccounts';

const router = useRouter();
const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'email', label: 'Email' },
  { key: 'clientId', label: 'Client ID' },
  { key: 'tenantId', label: 'Tenant ID' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Edit', class: 'bg-blue-100 text-blue-700 hover:bg-blue-200', handler: (row) => router.push(`/outlook-accounts/${row.id}/edit`) },
  { label: 'Delete', class: 'bg-red-100 text-red-700 hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete Outlook account "${row.email}"?`;
    confirmAction.value = () => deleteOutlookAccount(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const groupActions = [
  { label: 'Activate', action: 'activate', class: 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200' },
  { label: 'Inactivate', action: 'inactivate', class: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
  { label: 'Delete', action: 'delete', class: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
];

const handleGroupAction = async ({ action, ids }) => {
  confirmMessage.value = `${action} ${ids.length} account(s)?`;
  confirmAction.value = () => bulkActionOutlookAccounts(action, ids).then(() => tableRef.value?.loadData());
  confirmDialog.value = true;
};

const handleConfirm = async () => {
  loading.value = true;
  try { await confirmAction.value(); } catch (e) { console.error(e); }
  loading.value = false;
  confirmDialog.value = false;
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Outlook Accounts</h1>
      <router-link to="/outlook-accounts/add" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        + Add New Account
      </router-link>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getOutlookAccounts(params)).data"
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
