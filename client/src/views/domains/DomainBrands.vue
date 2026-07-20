<script setup>
import { ref } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import client from '../../api/client';
import { useToastStore } from '../../stores/toast';
import PageHeader from '../../components/common/PageHeader.vue';
const toastStore = useToastStore();

const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);
const showForm = ref(false);

const form = ref({ name: '', status: 'Activated' });

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Brand Name' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Delete', class: 'bg-danger-light text-danger hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete brand "${row.name}"?`;
    confirmAction.value = () => client.delete(`/domains/brands/${row.id}`).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const handleCreate = async () => {
  if (!form.value.name) return;
  loading.value = true;
  try {
    await client.post('/domains/brands', form.value);
    form.value = { name: '', status: 'Activated' };
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
      <PageHeader title="Domain Brands" />
      <button @click="showForm = !showForm" class="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors">
        {{ showForm ? 'Cancel' : '+ Add Brand' }}
      </button>
    </div>

    <div v-if="showForm" class="bg-surface rounded-xl border border-border p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Add Brand</h2>
      <div class="flex items-end gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-fg-secondary mb-1">Brand Name *</label>
          <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter brand name" />
        </div>
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Status</label>
          <select v-model="form.status" class="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
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
      :fetch-data="async (params) => (await client.get('/domains/brands', { params })).data"
      :actions="actions"
    />

    <ConfirmDialog :show="confirmDialog" title="Confirm Delete" :message="confirmMessage" confirm-text="Delete" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>