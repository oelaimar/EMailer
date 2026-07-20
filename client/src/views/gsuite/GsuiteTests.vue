<script setup>
import DataTable from '../../components/common/DataTable.vue';
import PageHeader from '../../components/common/PageHeader.vue';
import { getGsuiteTests } from '../../api/gsuiteProduction';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'createdAt', label: 'Start Time' },
  { key: 'mailer', label: 'Mailer' },
  { key: 'isp', label: 'ISP' },
  { key: 'status', label: 'Status' },
  { key: 'total', label: 'Total' },
  { key: 'progress', label: 'Progress' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'bounced', label: 'Bounced' },
  { key: 'opens', label: 'Opens' },
  { key: 'clicks', label: 'Clicks' },
];
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="GSuite Tests" />
      <router-link to="/gsuite-accounts" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">Back</router-link>
    </div>
    <DataTable :columns="columns" :fetch-data="async (params) => (await getGsuiteTests(params)).data">
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'In Progress' ? 'bg-primary-light text-primary' : value === 'Completed' ? 'bg-success-light text-success' : 'bg-surface-alt text-muted']">{{ value }}</span>
      </template>
    </DataTable>
  </div>
</template>
