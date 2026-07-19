<script setup>
import DataTable from '../../components/common/DataTable.vue';
import { getOutlookDrops } from '../../api/outlookProduction';

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
  { key: 'leads', label: 'Leads' },
  { key: 'unsubs', label: 'Unsubs' },
];
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Outlook Drops</h1>
      <router-link to="/outlook-accounts" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back</router-link>
    </div>
    <DataTable :columns="columns" :fetch-data="async (params) => (await getOutlookDrops(params)).data">
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'In Progress' ? 'bg-blue-100 text-blue-700' : value === 'Completed' ? 'bg-emerald-100 text-emerald-700' : value === 'Paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700']">{{ value }}</span>
      </template>
    </DataTable>
  </div>
</template>
