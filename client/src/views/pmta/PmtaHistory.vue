<script setup>
import DataTable from '../../components/common/DataTable.vue';
import client from '../../api/client';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'userEmail', label: 'User' },
  { key: 'model', label: 'Model' },
  { key: 'action', label: 'Action' },
  { key: 'recordName', label: 'Record' },
  { key: 'createdAt', label: 'Timestamp' },
];
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">PMTA History</h1>
      <router-link to="/pmta" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back to PMTA</router-link>
    </div>

    <DataTable
      :columns="columns"
      :fetch-data="async (params) => (await client.get('/pmta/history', { params })).data"
    >
      <template #cell-action="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'create' ? 'bg-emerald-100 text-emerald-700' : value === 'delete' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700']">
          {{ value }}
        </span>
      </template>
    </DataTable>
  </div>
</template>
