<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getElasticIps, allocateElasticIps, releaseElasticIps, deleteElasticIp } from '../../api/elasticIps';
import { getCloudInstances } from '../../api/cloudInstances';
import { useToastStore } from '../../stores/toast';
import PageHeader from '../../components/common/PageHeader.vue';
const toastStore = useToastStore();

const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);
const showAllocate = ref(false);
const instances = ref([]);

const allocateForm = ref({ cloudInstanceId: '', count: 1, region: '' });

onMounted(async () => {
  try {
    const { data } = await getCloudInstances({ limit: 1000, provider: 'aws' });
    instances.value = data.data || [];
  } catch (e) { /* ignore */ }
});

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'ipAddress', label: 'IP Address' },
  { key: 'allocationId', label: 'Allocation ID' },
  { key: 'cloudInstance', label: 'Instance', format: (v) => v?.instanceType || '-' },
  { key: 'region', label: 'Region' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Release', class: 'bg-danger-light text-danger hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Release Elastic IP "${row.ipAddress || row.id}"?`;
    confirmAction.value = () => releaseElasticIps([row.id]).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const handleAllocate = async () => {
  if (!allocateForm.value.count) return;
  loading.value = true;
  try {
    await allocateElasticIps(allocateForm.value);
    allocateForm.value = { cloudInstanceId: '', count: 1, region: '' };
    showAllocate.value = false;
    tableRef.value?.loadData();
  } catch (e) { toastStore.showToast('Action failed', 'error'); }
  finally { loading.value = false; }
};

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
      <PageHeader title="AWS Elastic IPs" />
      <div class="flex gap-2">
        <button @click="showAllocate = !showAllocate" class="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors">
          {{ showAllocate ? 'Cancel' : '+ Allocate IPs' }}
        </button>
        <router-link to="/cloud-instances" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">Back to Instances</router-link>
      </div>
    </div>

    <div v-if="showAllocate" class="bg-surface rounded-xl border border-border p-6 mb-6">
      <h2 class="text-lg font-semibold text-fg mb-4">Allocate Elastic IPs</h2>
      <form @submit.prevent="handleAllocate" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">AWS Instance</label>
          <select v-model="allocateForm.cloudInstanceId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">None</option>
            <option v-for="i in instances" :key="i.id" :value="i.id">{{ i.instanceType }} ({{ i.regions }})</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Quantity</label>
          <input v-model.number="allocateForm.count" type="number" min="1" max="50" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Region</label>
          <input v-model="allocateForm.region" type="text" placeholder="us-east-1" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div class="flex items-end">
          <button type="submit" :disabled="loading" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Allocating...' : 'Allocate' }}
          </button>
        </div>
      </form>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getElasticIps(params)).data"
      :actions="actions"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full',
          value === 'Allocated' ? 'bg-success-light text-success' :
          value === 'Associating' ? 'bg-primary-light text-primary' :
          value === 'Allocating' ? 'bg-yellow-100 text-yellow-700' :
          'bg-surface-alt text-muted']">
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