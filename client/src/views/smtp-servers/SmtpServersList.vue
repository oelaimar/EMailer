<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import PageHeader from '../../components/common/PageHeader.vue';
import StatusBadge from '../../components/common/StatusBadge.vue';
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
  { label: 'Activate', action: 'activate', class: 'bg-success-light text-success border-emerald-300' },
  { label: 'Inactivate', action: 'inactivate', class: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { label: 'Delete', action: 'delete', class: 'bg-danger-light text-danger border-red-300' },
];

const actions = [
  { label: 'Edit', class: 'bg-primary-light text-primary', handler: (row) => router.push(`/smtp-servers/${row.id}/edit`) },
  { label: 'Delete', class: 'bg-danger-light text-danger', handler: (row) => { deleteDialog.value = { show: true, id: row.id }; } },
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
    <PageHeader title="SMTP Servers" action-label="Add New SMTP Server" action-to="/smtp-servers/add" />

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
        <StatusBadge :value="value" />
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
