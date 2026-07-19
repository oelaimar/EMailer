<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import client from '../../api/client';

const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);
const showForm = ref(false);
const groups = ref([]);
const selectedGroupId = ref('');

const form = ref({ serverName: '', ip: '', domain: '', port: 25 });

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'serverName', label: 'Server Name' },
  { key: 'ip', label: 'IP' },
  { key: 'domain', label: 'Domain' },
  { key: 'port', label: 'Port' },
];

onMounted(async () => {
  try {
    const { data } = await client.get('/smtp-groups', { params: { limit: 500 } });
    groups.value = data.data || [];
  } catch { /* ignore */ }
});

const loadVmtas = () => {
  tableRef.value?.loadData();
};

const handleCreate = async () => {
  if (!selectedGroupId.value || !form.value.serverName) return;
  loading.value = true;
  try {
    await client.post(`/smtp-groups/${selectedGroupId.value}/vmtas`, form.value);
    form.value = { serverName: '', ip: '', domain: '', port: 25 };
    showForm.value = false;
    tableRef.value?.loadData();
  } catch (e) { console.error(e); }
  loading.value = false;
};

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
      <h1 class="text-2xl font-bold text-gray-800">Custom VMTAs</h1>
      <div class="flex items-center gap-2">
        <router-link to="/smtp-groups" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back</router-link>
        <button @click="showForm = !showForm" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors" :disabled="!selectedGroupId">
          {{ showForm ? 'Cancel' : '+ Add VMTA' }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-1">Select SMTP Group *</label>
      <select v-model="selectedGroupId" @change="loadVmtas" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
        <option value="">Select a group...</option>
        <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }} ({{ g.encryption }})</option>
      </select>
    </div>

    <div v-if="showForm && selectedGroupId" class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Server Name *</label>
          <input v-model="form.serverName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">IP</label>
          <input v-model="form.ip" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Domain</label>
          <input v-model="form.domain" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div class="flex items-end">
          <button @click="handleCreate" :disabled="loading" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
            {{ loading ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedGroupId">
      <DataTable
        ref="tableRef"
        :columns="columns"
        :fetch-data="async (params) => (await client.get(`/smtp-groups/${selectedGroupId}/vmtas`, { params })).data"
        :actions="[
          { label: 'Delete', class: 'bg-red-100 text-red-700 hover:bg-red-200', handler: (row) => {
            confirmMessage = `Delete custom VMTA '${row.serverName}'?`;
            confirmAction = () => client.delete(`/smtp-groups/${selectedGroupId}/vmtas/${row.id}`).then(() => tableRef.value?.loadData());
            confirmDialog = true;
          }},
        ]"
      />
    </div>
    <div v-else class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
      Select an SMTP group to view custom VMTAs.
    </div>

    <ConfirmDialog :show="confirmDialog" title="Confirm Delete" :message="confirmMessage" confirm-text="Delete" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
