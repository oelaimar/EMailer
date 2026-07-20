<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import client from '../../api/client';
import { getDomains } from '../../api/domains';
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();

const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);
const showForm = ref(false);
const domains = ref([]);

const form = ref({ domainId: '', subdomain: '', status: 'Activated' });

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'subdomain', label: 'Subdomain' },
  { key: 'domainId', label: 'Parent Domain' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Delete', class: 'bg-red-100 text-red-700 hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete subdomain "${row.subdomain}"?`;
    confirmAction.value = () => client.delete(`/domains/subdomains/${row.id}`).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

onMounted(async () => {
  try { const { data } = await getDomains({ limit: 1000 }); domains.value = data.data || []; } catch { domains.value = []; }
});

const handleCreate = async () => {
  if (!form.value.domainId || !form.value.subdomain) return;
  loading.value = true;
  try {
    await client.post('/domains/subdomains', form.value);
    form.value = { domainId: '', subdomain: '', status: 'Activated' };
    showForm.value = false;
    tableRef.value?.loadData();
  } catch (e) { toastStore.showToast('Action failed', 'error'); }
  loading.value = false;
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
      <h1 class="text-2xl font-bold text-gray-800">Subdomains</h1>
      <div class="flex items-center gap-2">
        <router-link to="/domains" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Domains List</router-link>
        <button @click="showForm = !showForm" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          {{ showForm ? 'Cancel' : '+ Add Subdomain' }}
        </button>
      </div>
    </div>

    <div v-if="showForm" class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Add Subdomain</h2>
      <div class="flex items-end gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Parent Domain *</label>
          <select v-model="form.domainId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Select domain...</option>
            <option v-for="d in domains" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Subdomain *</label>
          <input v-model="form.subdomain" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. mail.example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="form.status" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="Activated">Activated</option>
            <option value="Inactivated">Inactivated</option>
          </select>
        </div>
        <button @click="handleCreate" :disabled="loading" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
          {{ loading ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await client.get('/domains/subdomains', { params })).data"
      :actions="actions"
    />

    <ConfirmDialog :show="confirmDialog" title="Confirm Delete" :message="confirmMessage" confirm-text="Delete" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
