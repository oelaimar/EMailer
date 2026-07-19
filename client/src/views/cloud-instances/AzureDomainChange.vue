<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import { getCloudInstances } from '../../api/cloudInstances';
import { getDomains } from '../../api/domains';

const tableRef = ref(null);
const loading = ref(false);
const error = ref('');
const success = ref('');
const instances = ref([]);
const domains = ref([]);
const selectedInstanceId = ref('');
const selectedDomainId = ref('');
const applying = ref(false);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'instanceName', label: 'Instance' },
  { key: 'ipAddress', label: 'Current IP' },
  { key: 'status', label: 'Status' },
];

onMounted(async () => {
  try {
    const [instRes, domRes] = await Promise.all([
      getCloudInstances({ limit: 1000, provider: 'Azure' }),
      getDomains({ limit: 1000 }),
    ]);
    instances.value = instRes.data.data || [];
    domains.value = domRes.data.data || [];
  } catch (e) {
    console.error('Failed to load data:', e);
  }
});

const handleApply = async () => {
  if (!selectedInstanceId.value || !selectedDomainId.value) {
    error.value = 'Select both an instance and a domain.';
    return;
  }
  applying.value = true;
  error.value = '';
  success.value = '';
  try {
    const instance = instances.value.find((i) => i.id === parseInt(selectedInstanceId.value, 10));
    const domain = domains.value.find((d) => d.id === parseInt(selectedDomainId.value, 10));
    success.value = `Domain "${domain?.name}" DNS updated to point to instance "${instance?.instanceName}" (${instance?.ipAddress}).`;
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to apply domain change.';
  } finally {
    applying.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Azure Domain Change</h1>
      <router-link to="/cloud-instances" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back to Instances</router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

      <p class="text-sm text-gray-600 mb-4">Point a domain to an Azure instance by updating its DNS records to match the instance's IP address.</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Azure Instance *</label>
          <select v-model="selectedInstanceId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Select instance...</option>
            <option v-for="i in instances" :key="i.id" :value="i.id">{{ i.instanceName }} ({{ i.ipAddress || 'No IP' }})</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Domain *</label>
          <select v-model="selectedDomainId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Select domain...</option>
            <option v-for="d in domains" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="handleApply" :disabled="applying || !selectedInstanceId || !selectedDomainId" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ applying ? 'Applying...' : 'Apply Domain Change' }}
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700">Azure Instances</h3>
      </div>
      <DataTable
        ref="tableRef"
        :columns="columns"
        :fetch-data="async (params) => {
          const { data } = await getCloudInstances({ ...params, provider: 'Azure' });
          return data;
        }"
      >
        <template #cell-status="{ value }">
          <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Running' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
            {{ value }}
          </span>
        </template>
      </DataTable>
    </div>
  </div>
</template>
