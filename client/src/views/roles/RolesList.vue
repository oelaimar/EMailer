<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import PageHeader from '../../components/common/PageHeader.vue';
import StatusBadge from '../../components/common/StatusBadge.vue';
import { getRoles, deleteRole } from '../../api/roles';

const router = useRouter();
const tableRef = ref(null);
const deleteDialog = ref({ show: false, id: null });

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'type', label: 'Type' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Edit', class: 'bg-primary-light text-primary', handler: (row) => router.push(`/roles/${row.id}/edit`) },
  { label: 'Delete', class: 'bg-danger-light text-danger', handler: (row) => { deleteDialog.value = { show: true, id: row.id }; } },
];

const confirmDelete = async () => {
  await deleteRole(deleteDialog.value.id);
  deleteDialog.value = { show: false, id: null };
  tableRef.value?.loadData();
};
</script>

<template>
  <div>
    <PageHeader title="Roles" action-label="Add New Role" action-to="/roles/add" />

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getRoles(params)).data"
      :actions="actions"
    >
      <template #cell-status="{ value }">
        <StatusBadge :value="value" />
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(value).toLocaleDateString() }}
      </template>
    </DataTable>

    <ConfirmDialog
      :show="deleteDialog.show"
      title="Delete Role"
      message="Are you sure you want to delete this role?"
      confirm-text="Delete"
      @confirm="confirmDelete"
      @cancel="deleteDialog.show = false"
    />
  </div>
</template>
