<script setup>
import { ref } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import { getFullReport } from '../../api/statistics';

const tableRef = ref(null);
const dateFrom = ref('');
const dateTo = ref('');
const search = ref('');

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'processName', label: 'Process' },
  { key: 'production', label: 'Production' },
  { key: 'dataList', label: 'Data List' },
  { key: 'smtpGroup', label: 'SMTP Group' },
  { key: 'mtaServer', label: 'MTA Server' },
  { key: 'offer', label: 'Offer' },
  { key: 'status', label: 'Status' },
  { key: 'speed', label: 'Speed' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdAt', label: 'Created' },
];

const fetchData = async (params) => {
  const query = { ...params };
  if (search.value) query.search = search.value;
  if (dateFrom.value) query.dateFrom = dateFrom.value;
  if (dateTo.value) query.dateTo = dateTo.value;
  const { data } = await getFullReport(query);
  return data;
};

const applyFilters = () => {
  tableRef.value?.loadData();
};

const statusColor = (s) => {
  if (s === 'Running') return 'bg-emerald-100 text-emerald-700';
  if (s === 'Completed') return 'bg-blue-100 text-blue-700';
  if (s === 'Failed') return 'bg-red-100 text-red-700';
  if (s === 'Paused') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Full Statistics Report</h1>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input v-model="search" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Process name..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
          <input v-model="dateFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
          <input v-model="dateTo" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div class="flex items-end">
          <button @click="applyFilters" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">Apply Filters</button>
        </div>
      </div>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchData"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusColor(value)]">{{ value }}</span>
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(value).toLocaleDateString() }}
      </template>
    </DataTable>
  </div>
</template>
