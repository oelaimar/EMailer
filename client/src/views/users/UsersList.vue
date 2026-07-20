<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import PageHeader from '../../components/common/PageHeader.vue';
import StatusBadge from '../../components/common/StatusBadge.vue';
import { getUsers, deleteUser } from '../../api/users';

const router = useRouter();
const tableRef = ref(null);
const deleteDialog = ref({ show: false, id: null });

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'productionId', label: 'Prod ID' },
  { key: 'superUserStatus', label: 'Super User' },
  { key: 'status', label: 'Status' },
];

const actions = [
  { label: 'Edit', class: 'bg-primary-light text-primary', handler: (row) => router.push(`/users/${row.id}/edit`) },
  { label: 'Delete', class: 'bg-danger-light text-danger', handler: (row) => { deleteDialog.value = { show: true, id: row.id }; } },
];

const confirmDelete = async () => {
  await deleteUser(deleteDialog.value.id);
  deleteDialog.value = { show: false, id: null };
  tableRef.value?.loadData();
};
</script>

<template>
  <div>
    <PageHeader title="Users" action-label="Add New User" action-to="/users/add" />

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getUsers(params)).data"
      :selectable="true"
      :actions="actions"
    >
      <template #cell-status="{ value }">
        <StatusBadge :value="value" />
      </template>
      <template #cell-superUserStatus="{ value }">
        <StatusBadge :value="value" />
      </template>
    </DataTable>

    <ConfirmDialog
      :show="deleteDialog.show"
      title="Delete User"
      message="Are you sure you want to delete this user?"
      confirm-text="Delete"
      @confirm="confirmDelete"
      @cancel="deleteDialog.show = false"
    />
  </div>
</template>
