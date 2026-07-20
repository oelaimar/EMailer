<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import PageHeader from '../../components/common/PageHeader.vue';
import StatusBadge from '../../components/common/StatusBadge.vue';
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
  { label: 'Edit', class: 'bg-primary-light text-primary hover:bg-blue-200', handler: (row) => router.push(`/cloud-accounts/${row.id}/edit`) },
  { label: 'Delete', class: 'bg-danger-light text-danger hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete cloud account "${row.name}"?`;
    confirmAction.value = () => deleteCloudAccount(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const groupActions = [
  { label: 'Activate', action: 'activate', class: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
  { label: 'Inactivate', action: 'inactivate', class: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
  { label: 'Delete', action: 'delete', class: 'bg-danger-light text-danger border-red-300 hover:bg-red-200' },
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
    <PageHeader title="Cloud Accounts" action-label="Add New Account" action-to="/cloud-accounts/add" />

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
        <StatusBadge :value="value" />
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(value).toLocaleDateString() }}
      </template>
    </DataTable>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
