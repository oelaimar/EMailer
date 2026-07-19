<script setup>
import { ref } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getAuditLogs, deleteAuditLog, bulkActionAuditLogs } from '../../api/auditLogs';

const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'actionBy', label: 'Action By' },
  { key: 'recordId', label: 'Record ID' },
  { key: 'recordName', label: 'Record Name' },
  { key: 'recordType', label: 'Record Type' },
  { key: 'actionType', label: 'Action Type' },
  { key: 'actionTime', label: 'Action Time' },
];

const actions = [
  { label: 'Delete', class: 'bg-red-100 text-red-700 hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete audit log #${row.id}?`;
    confirmAction.value = () => deleteAuditLog(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const groupActions = [
  { label: 'Delete', action: 'delete', class: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
];

const handleGroupAction = async ({ action, ids }) => {
  confirmMessage.value = `Delete ${ids.length} audit log(s)?`;
  confirmAction.value = () => bulkActionAuditLogs(action, ids).then(() => tableRef.value?.loadData());
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
      <h1 class="text-2xl font-bold text-gray-800">Audit Logs</h1>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getAuditLogs(params)).data"
      :selectable="true"
      :actions="actions"
      :group-actions="groupActions"
      @group-action="handleGroupAction"
    >
      <template #cell-actionTime="{ value }">
        {{ new Date(value).toLocaleString() }}
      </template>
    </DataTable>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
