<script setup>
import DataTable from '../../components/common/DataTable.vue';
import client from '../../api/client';
import PageHeader from '../../components/common/PageHeader.vue';

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
      <PageHeader title="PMTA History" />
      <router-link to="/pmta/commands" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">Back to PMTA</router-link>
    </div>

    <DataTable
      :columns="columns"
      :fetch-data="async (params) => (await client.get('/pmta/history', { params })).data"
    >
      <template #cell-action="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'create' ? 'bg-success-light text-success' : value === 'delete' ? 'bg-danger-light text-danger' : 'bg-primary-light text-primary']">
          {{ value }}
        </span>
      </template>
    </DataTable>
  </div>
</template>