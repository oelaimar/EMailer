<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getCloudInstances } from '../../api/cloudInstances';

const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'provider', label: 'Provider' },
  { key: 'instanceName', label: 'Instance' },
  { key: 'instanceType', label: 'Type' },
  { key: 'region', label: 'Region' },
  { key: 'status', label: 'Status' },
  { key: 'ipAddress', label: 'IP Address' },
  { key: 'createdAt', label: 'Created' },
];

const handleConfirm = async () => {
  loading.value = true;
  try { await confirmAction.value(); } catch (e) { console.error(e); }
  loading.value = false;
  confirmDialog.value = false;
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Azure Manager Processes</h1>
      <router-link to="/cloud-instances" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back to Instances</router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <p class="text-sm text-gray-600">Azure-specific manager processes. Select Azure instances below to manage their lifecycle, DNS changes, and resource operations.</p>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => {
        const { data } = await getCloudInstances({ ...params, provider: 'Azure' });
        return data;
      }"
    >
      <template #cell-provider="{ value }">
        <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">{{ value }}</span>
      </template>
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Running' ? 'bg-green-100 text-green-700' : value === 'Stopped' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600']">
          {{ value }}
        </span>
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(value).toLocaleDateString() }}
      </template>
    </DataTable>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
