<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
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
  { label: 'Edit', class: 'bg-blue-100 text-blue-700', handler: (row) => router.push(`/users/${row.id}/edit`) },
  { label: 'Delete', class: 'bg-red-100 text-red-700', handler: (row) => { deleteDialog.value = { show: true, id: row.id }; } },
];

const confirmDelete = async () => {
  await deleteUser(deleteDialog.value.id);
  deleteDialog.value = { show: false, id: null };
  tableRef.value?.loadData();
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Users</h1>
      <router-link to="/users/add" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        + Add New User
      </router-link>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getUsers(params)).data"
      :selectable="true"
      :actions="actions"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Activated' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700']">
          {{ value }}
        </span>
      </template>
      <template #cell-superUserStatus="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Activated' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600']">
          {{ value }}
        </span>
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
