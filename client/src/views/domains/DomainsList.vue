<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import PageHeader from '../../components/common/PageHeader.vue';
import { getDomains, deleteDomain, bulkActionDomains } from '../../api/domains';
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();

const router = useRouter();
const tableRef = ref(null);
const selected = ref([]);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Domain' },
  { key: 'accountName', label: 'Account' },
  { key: 'status', label: 'Status' },
  { key: 'availability', label: 'Availability' },
  { key: 'flag', label: 'Flag' },
  { key: 'expirationDate', label: 'Expires' },
  { key: 'hasBrand', label: 'Brand' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Edit', class: 'bg-primary-light text-primary hover:bg-blue-200', handler: (row) => router.push(`/domains/${row.id}/edit`) },
  { label: 'Delete', class: 'bg-danger-light text-danger hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete domain "${row.name}"?`;
    confirmAction.value = () => deleteDomain(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const groupActions = [
  { label: 'Activate', action: 'activate', class: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
  { label: 'Set Special', action: 'special', class: 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200' },
  { label: 'Set Privat', action: 'privat', class: 'bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200' },
  { label: 'Inactivate', action: 'inactivate', class: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
  { label: 'Delete', action: 'delete', class: 'bg-danger-light text-danger border-red-300 hover:bg-red-200' },
];

const handleGroupAction = async ({ action, ids }) => {
  confirmMessage.value = `${action} ${ids.length} domain(s)?`;
  confirmAction.value = () => bulkActionDomains(action, ids).then(() => tableRef.value?.loadData());
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
    <PageHeader title="Domains" action-label="Add Domain" action-to="/domains/add" />

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getDomains(params)).data"
      :selectable="true"
      :actions="actions"
      :group-actions="groupActions"
      @group-action="handleGroupAction"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full',
          value === 'Activated' ? 'bg-success-light text-success' :
          value === 'Special' ? 'bg-purple-100 text-purple-700' :
          value === 'Privat' ? 'bg-indigo-100 text-indigo-700' :
          'bg-surface-alt text-muted']">
          {{ value }}
        </span>
      </template>
      <template #cell-availability="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Available' ? 'bg-success-light text-success' : 'bg-danger-light text-danger']">
          {{ value }}
        </span>
      </template>
      <template #cell-hasBrand="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value ? 'bg-success-light text-success' : 'bg-surface-alt text-muted']">
          {{ value ? 'Yes' : 'No' }}
        </span>
      </template>
      <template #cell-expirationDate="{ value }">
        {{ value ? new Date(value).toLocaleDateString() : '-' }}
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(value).toLocaleDateString() }}
      </template>
    </DataTable>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
