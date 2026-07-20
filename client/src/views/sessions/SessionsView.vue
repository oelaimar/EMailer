<script setup>
import { ref } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getSessions, forceDisconnectSessions } from '../../api/sessions';
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();

const tableRef = ref(null);
const selected = ref([]);
const confirmDialog = ref(false);
const loading = ref(false);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'productionId', label: 'Prod ID' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
];

const handleForceDisconnect = async () => {
  if (!selected.value.length) return;
  confirmDialog.value = true;
};

const confirmDisconnect = async () => {
  loading.value = true;
  try {
    await forceDisconnectSessions(selected.value);
    selected.value = [];
    tableRef.value?.loadData();
  } catch (e) { toastStore.showToast('Action failed', 'error'); } finally {
    loading.value = false;
    confirmDialog.value = false;
  }
};
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Sessions</h1>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getSessions(params)).data"
      :selectable="true"
      @update:selected="(val) => selected = val"
    >
      <template #header-actions>
        <button @click="handleForceDisconnect" :disabled="!selected.length" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs font-medium rounded-lg transition-colors">
          Force Disconnect ({{ selected.length }})
        </button>
      </template>
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600']">
          {{ value }}
        </span>
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(value).toLocaleString() }}
      </template>
    </DataTable>

    <ConfirmDialog
      :show="confirmDialog"
      title="Force Disconnect"
      :message="`Disconnect ${selected.length} session(s)?`"
      confirm-text="Disconnect"
      @confirm="confirmDisconnect"
      @cancel="confirmDialog = false"
    />
  </div>
</template>
