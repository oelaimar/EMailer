<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import client from '../../api/client';
import { getDataLists } from '../../api/dataLists';

const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);
const showForm = ref(false);
const dataLists = ref([]);

const form = ref({ email: '', domain: '', reason: '', dataListId: '' });

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'email', label: 'Email' },
  { key: 'domain', label: 'Domain' },
  { key: 'reason', label: 'Reason' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Delete', class: 'bg-red-100 text-red-700 hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete blacklist entry?`;
    confirmAction.value = () => client.delete(`/data-lists/blacklists/${row.id}`).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

onMounted(async () => {
  try { const { data } = await getDataLists({ limit: 1000 }); dataLists.value = data.data || []; } catch { dataLists.value = []; }
});

const handleCreate = async () => {
  if (!form.value.email && !form.value.domain) return;
  loading.value = true;
  try {
    await client.post('/data-lists/blacklists', form.value);
    form.value = { email: '', domain: '', reason: '', dataListId: '' };
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
      <h1 class="text-2xl font-bold text-gray-800">Blacklists</h1>
      <div class="flex items-center gap-2">
        <router-link to="/data-lists" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Data Lists</router-link>
        <button @click="showForm = !showForm" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          {{ showForm ? 'Cancel' : '+ Add Entry' }}
        </button>
      </div>
    </div>

    <div v-if="showForm" class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="form.email" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="user@example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Domain</label>
          <input v-model="form.domain" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <input v-model="form.reason" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Optional reason" />
        </div>
        <div class="flex items-end">
          <button @click="handleCreate" :disabled="loading" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
            {{ loading ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await client.get('/data-lists/blacklists', { params })).data"
      :actions="actions"
    />

    <ConfirmDialog :show="confirmDialog" title="Confirm Delete" :message="confirmMessage" confirm-text="Delete" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
