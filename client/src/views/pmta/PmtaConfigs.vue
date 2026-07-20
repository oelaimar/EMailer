<script setup>
import { ref, onMounted } from 'vue';
import client from '../../api/client';
import PageHeader from '../../components/common/PageHeader.vue';

const loading = ref(false);
const error = ref('');
const success = ref('');
const configs = ref([]);
const editingId = ref(null);
const editForm = ref({});

onMounted(async () => {
  try {
    const { data } = await client.get('/pmta/configs');
    configs.value = data.data || data || [];
  } catch { configs.value = []; }
});

const startEdit = (config) => {
  editingId.value = config.id;
  editForm.value = { ...config };
};

const cancelEdit = () => {
  editingId.value = null;
  editForm.value = {};
};

const saveConfig = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    await client.put(`/pmta/configs/${editingId.value}`, editForm.value);
    success.value = 'Configuration saved.';
    editingId.value = null;
    const { data } = await client.get('/pmta/configs');
    configs.value = data.data || data || [];
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="PMTA Configurations" />
      <router-link to="/pmta/commands" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">Back to PMTA</router-link>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
    <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

    <div v-if="configs.length === 0" class="bg-surface rounded-xl border border-border p-12 text-center text-muted">
      No PMTA configurations found.
    </div>

    <div v-for="config in configs" :key="config.id" class="bg-surface rounded-xl border border-border p-6 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-fg-secondary">{{ config.name || config.key || `Config #${config.id}` }}</h3>
        <div class="flex gap-2">
          <button v-if="editingId !== config.id" @click="startEdit(config)" class="px-3 py-1 bg-primary-light text-primary text-xs font-medium rounded-lg hover:bg-blue-200">Edit</button>
          <template v-else>
            <button @click="saveConfig" :disabled="loading" class="px-3 py-1 bg-success-light text-success text-xs font-medium rounded-lg hover:bg-green-200 disabled:opacity-50">Save</button>
            <button @click="cancelEdit" class="px-3 py-1 bg-surface-alt text-fg-secondary text-xs font-medium rounded-lg hover:bg-blue-200">Cancel</button>
          </template>
        </div>
      </div>
      <div v-if="editingId === config.id">
        <textarea v-model="editForm" rows="10" class="w-full px-3 py-2 border border-border rounded-lg text-xs font-mono focus:border-primary outline-none"></textarea>
      </div>
      <pre v-else class="bg-surface-alt p-3 rounded-lg text-xs font-mono text-fg-secondary overflow-x-auto max-h-48">{{ config.value || JSON.stringify(config, null, 2) }}</pre>
    </div>
  </div>
</template>
