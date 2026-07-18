<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getSmtpServers, deleteSmtpServer, bulkActionSmtpServers } from '../../api/smtpServers';

const router = useRouter();
const tableRef = ref(null);
const deleteDialog = ref({ show: false, id: null });
const groupDeleteDialog = ref({ show: false, ids: [] });

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'host', label: 'Host' },
  { key: 'port', label: 'Port' },
  { key: 'encryption', label: 'Encryption' },
  { key: 'status', label: 'Status' },
  { key: 'expirationDate', label: 'Expiration' },
];

const groupActions = [
  { label: 'Activate', action: 'activate', class: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { label: 'Inactivate', action: 'inactivate', class: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { label: 'Delete', action: 'delete', class: 'bg-red-100 text-red-700 border-red-300' },
];

const actions = [
  { label: 'Edit', class: 'bg-blue-100 text-blue-700', handler: (row) => router.push(`/smtp-servers/${row.id}/edit`) },
  { label: 'Delete', class: 'bg-red-100 text-red-700', handler: (row) => { deleteDialog.value = { show: true, id: row.id }; } },
];

const handleGroupAction = async ({ action, ids }) => {
  if (action === 'delete') {
    groupDeleteDialog.value = { show: true, ids };
    return;
  }
  await bulkActionSmtpServers(action, ids);
  tableRef.value?.loadData();
};

const confirmGroupDelete = async () => {
  await bulkActionSmtpServers('delete', groupDeleteDialog.value.ids);
  groupDeleteDialog.value = { show: false, ids: [] };
  tableRef.value?.loadData();
};

const confirmDelete = async () => {
  await deleteSmtpServer(deleteDialog.value.id);
  deleteDialog.value = { show: false, id: null };
  tableRef.value?.loadData();
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">SMTP Servers</h1>
      <router-link to="/smtp-servers/add" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        + Add New SMTP Server
      </router-link>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getSmtpServers(params)).data"
      :selectable="true"
      :actions="actions"
      :group-actions="groupActions"
      @group-action="handleGroupAction"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Activated' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700']">
          {{ value }}
        </span>
      </template>
    </DataTable>

    <ConfirmDialog
      :show="deleteDialog.show"
      title="Delete SMTP Server"
      message="Are you sure you want to delete this SMTP server?"
      confirm-text="Delete"
      @confirm="confirmDelete"
      @cancel="deleteDialog.show = false"
    />

    <ConfirmDialog
      :show="groupDeleteDialog.show"
      title="Delete SMTP Servers"
      :message="`Delete ${groupDeleteDialog.ids.length} server(s)?`"
      confirm-text="Delete"
      @confirm="confirmGroupDelete"
      @cancel="groupDeleteDialog.show = false"
    />
  </div>
</template>
