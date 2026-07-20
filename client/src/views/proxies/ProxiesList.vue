<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import PageHeader from '../../components/common/PageHeader.vue';
import StatusBadge from '../../components/common/StatusBadge.vue';
import { getProxies, deleteProxy, bulkActionProxies } from '../../api/proxies';
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();

const router = useRouter();
const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'ip', label: 'IP Address' },
  { key: 'port', label: 'Port' },
  { key: 'type', label: 'Type' },
  { key: 'username', label: 'Username' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Edit', class: 'bg-primary-light text-primary hover:bg-blue-200', handler: (row) => router.push(`/proxies/${row.id}/edit`) },
  { label: 'Delete', class: 'bg-danger-light text-danger hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete proxy "${row.ip}:${row.port}"?`;
    confirmAction.value = () => deleteProxy(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const groupActions = [
  { label: 'Activate', action: 'activate', class: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
  { label: 'Inactivate', action: 'inactivate', class: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
  { label: 'Delete', action: 'delete', class: 'bg-danger-light text-danger border-red-300 hover:bg-red-200' },
];

const handleGroupAction = async ({ action, ids }) => {
  confirmMessage.value = `${action} ${ids.length} proxy(s)?`;
  confirmAction.value = () => bulkActionProxies(action, ids).then(() => tableRef.value?.loadData());
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
    <PageHeader title="Proxies" action-label="Add New Proxy" action-to="/proxies/add" />

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getProxies(params)).data"
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
