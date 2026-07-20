<script setup>
import { ref } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getGsuiteDrops } from '../../api/gsuiteProduction';
import { executeProcessAction } from '../../api/production';
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();

const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);

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

const actions = [
  { label: 'Pause', class: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', handler: (row) => {
    confirmMessage.value = `Pause process #${row.id}?`;
    confirmAction.value = () => executeProcessAction(row.id, 'pause').then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
  { label: 'Stop', class: 'bg-red-100 text-red-700 hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Stop process #${row.id}?`;
    confirmAction.value = () => executeProcessAction(row.id, 'stop').then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const handleConfirm = async () => {
  loading.value = true;
  try { await confirmAction.value(); } catch (e) { toastStore.showToast('Action failed', 'error'); }
  loading.value = false;
  confirmDialog.value = false;
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">GSuite Drops</h1>
      <router-link to="/gsuite-accounts" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back</router-link>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getGsuiteDrops(params)).data"
      :selectable="true"
      :actions="actions"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'In Progress' ? 'bg-blue-100 text-blue-700' : value === 'Completed' ? 'bg-emerald-100 text-emerald-700' : value === 'Paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700']">
          {{ value }}
        </span>
      </template>
    </DataTable>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
