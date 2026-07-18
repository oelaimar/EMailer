<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
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
  { label: 'Edit', class: 'bg-blue-100 text-blue-700', handler: (row) => router.push(`/roles/${row.id}/edit`) },
  { label: 'Delete', class: 'bg-red-100 text-red-700', handler: (row) => { deleteDialog.value = { show: true, id: row.id }; } },
];

const confirmDelete = async () => {
  await deleteRole(deleteDialog.value.id);
  deleteDialog.value = { show: false, id: null };
  tableRef.value?.loadData();
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Roles</h1>
      <router-link to="/roles/add" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        + Add New Role
      </router-link>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getRoles(params)).data"
      :actions="actions"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Activated' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700']">
          {{ value }}
        </span>
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
