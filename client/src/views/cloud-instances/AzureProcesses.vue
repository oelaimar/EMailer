<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getCloudInstances } from '../../api/cloudInstances';
import { useToastStore } from '../../stores/toast';
import PageHeader from '../../components/common/PageHeader.vue';
const toastStore = useToastStore();

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
  try { await confirmAction.value(); } catch (e) { toastStore.showToast('Action failed', 'error'); }
  loading.value = false;
  confirmDialog.value = false;
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="Azure Manager Processes" />
      <router-link to="/cloud-instances" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">Back to Instances</router-link>
    </div>

    <div class="bg-surface rounded-xl border border-border p-6 mb-6">
      <p class="text-sm text-muted">Azure-specific manager processes. Select Azure instances below to manage their lifecycle, DNS changes, and resource operations.</p>
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
        <span class="px-2 py-1 text-xs font-medium rounded-full bg-primary-light text-primary">{{ value }}</span>
      </template>
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Running' ? 'bg-success-light text-success' : value === 'Stopped' ? 'bg-danger-light text-danger' : 'bg-surface-alt text-muted']">
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