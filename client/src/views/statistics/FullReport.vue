<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import { getFullReport, getReportColumns } from '../../api/statistics';

const tableRef = ref(null);
const columns = ref([]);
const availableColumns = ref([]);
const showColumnBuilder = ref(false);
const dateFrom = ref('');
const dateTo = ref('');
const statusFilter = ref('');
const search = ref('');

onMounted(async () => {
  try {
    const { data } = await getReportColumns();
    availableColumns.value = data.columns || [];
    columns.value = availableColumns.value.map((c) => ({ key: c.key, label: c.label }));
  } catch (e) {
    columns.value = [
      { key: 'id', label: 'ID' }, { key: 'processName', label: 'Process' },
      { key: 'production', label: 'Production' }, { key: 'dataList', label: 'Data List' },
      { key: 'smtpGroup', label: 'SMTP Group' }, { key: 'mtaServer', label: 'MTA Server' },
      { key: 'offer', label: 'Offer' }, { key: 'status', label: 'Status' },
      { key: 'speed', label: 'Speed' }, { key: 'createdAt', label: 'Created' },
    ];
  }
});

const selectedColumns = ref([]);

const toggleColumn = (key) => {
  const idx = selectedColumns.value.indexOf(key);
  if (idx >= 0) selectedColumns.value.splice(idx, 1);
  else selectedColumns.value.push(key);
};

const applyColumns = () => {
  if (selectedColumns.value.length > 0) {
    columns.value = availableColumns.value
      .filter((c) => selectedColumns.value.includes(c.key))
      .map((c) => ({ key: c.key, label: c.label }));
  }
  showColumnBuilder.value = false;
};

const resetColumns = () => {
  columns.value = availableColumns.value.map((c) => ({ key: c.key, label: c.label }));
  selectedColumns.value = [];
  showColumnBuilder.value = false;
};

const fetchData = async (params) => {
  const query = { ...params };
  if (search.value) query.search = search.value;
  if (dateFrom.value) query.dateFrom = dateFrom.value;
  if (dateTo.value) query.dateTo = dateTo.value;
  if (statusFilter.value) query.status = statusFilter.value;
  query.columns = columns.value.map((c) => c.key).join(',');
  const { data } = await getFullReport(query);
  return data;
};

const applyFilters = () => { tableRef.value?.loadData(); };

const exportCSV = async () => {
  try {
    const query = { limit: 10000, columns: columns.value.map((c) => c.key).join(',') };
    if (dateFrom.value) query.dateFrom = dateFrom.value;
    if (dateTo.value) query.dateTo = dateTo.value;
    if (statusFilter.value) query.status = statusFilter.value;
    const { data } = await getFullReport(query);
    const headers = columns.value.map((c) => c.label).join(',');
    const rows = (data.data || []).map((row) => columns.value.map((c) => {
      const val = row[c.key];
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : (val ?? '');
    }).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'revenue-report.csv'; a.click();
    URL.revokeObjectURL(url);
  } catch (e) { console.error(e); }
};

const formatValue = (val, key) => {
  if (val === null || val === undefined || val === '') return '-';
  if (key === 'earnings' || key === 'revenuePerEmail') return '$' + Number(val).toFixed(2);
  if (key.includes('Rate')) return val + '%';
  if (key === 'createdAt' || key === 'updatedAt' || key === 'scheduleAt') return new Date(val).toLocaleDateString();
  return val;
};

const statusColor = (s) => {
  if (s === 'Running') return 'bg-blue-100 text-blue-700';
  if (s === 'Completed') return 'bg-emerald-100 text-emerald-700';
  if (s === 'Failed') return 'bg-red-100 text-red-700';
  if (s === 'Paused') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Full Revenue Report</h1>
      <div class="flex gap-2">
        <button @click="showColumnBuilder = !showColumnBuilder" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
          {{ showColumnBuilder ? 'Hide Columns' : 'Customize Columns' }}
        </button>
        <button @click="exportCSV" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">Export CSV</button>
      </div>
    </div>

    <div v-if="showColumnBuilder" class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-700">Select Columns ({{ selectedColumns.length }} selected)</h3>
        <div class="flex gap-2">
          <button @click="resetColumns" class="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">Reset All</button>
          <button @click="applyColumns" class="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply</button>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
        <label v-for="col in availableColumns" :key="col.key" class="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-gray-50 cursor-pointer">
          <input type="checkbox" :checked="selectedColumns.includes(col.key)" @change="toggleColumn(col.key)" class="rounded" />
          <span class="text-gray-700">{{ col.label }}</span>
          <span class="text-xs text-gray-400">{{ col.type }}</span>
        </label>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input v-model="search" type="text" placeholder="Process, subject, email..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
          <input v-model="dateFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
          <input v-model="dateTo" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="statusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Running">Running</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Paused">Paused</option>
            <option value="Stopped">Stopped</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="applyFilters" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">Apply</button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr>
            <th v-for="col in columns" :key="col.key" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{{ col.label }}</th>
          </tr>
        </thead>
      </table>
      <DataTable
        ref="tableRef"
        :columns="columns"
        :fetch-data="fetchData"
      >
        <template #cell-status="{ value }">
          <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusColor(value)]">{{ value }}</span>
        </template>
        <template v-for="col in columns" :key="col.key" #[`cell-${col.key}`]="{ value }">
          <span v-if="col.key === 'status'" />
          <span v-else-if="col.key === 'earnings' || col.key === 'revenuePerEmail'" class="font-medium text-emerald-700">{{ formatValue(value, col.key) }}</span>
          <span v-else-if="col.key.includes('Rate')" class="font-medium text-blue-700">{{ formatValue(value, col.key) }}</span>
          <span v-else>{{ formatValue(value, col.key) }}</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>
