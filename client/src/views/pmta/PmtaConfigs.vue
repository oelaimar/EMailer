<script setup>
import { ref, onMounted } from 'vue';
import client from '../../api/client';

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
      <h1 class="text-2xl font-bold text-gray-800">PMTA Configurations</h1>
      <router-link to="/pmta" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back to PMTA</router-link>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
    <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

    <div v-if="configs.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
      No PMTA configurations found.
    </div>

    <div v-for="config in configs" :key="config.id" class="bg-white rounded-xl border border-gray-200 p-6 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-700">{{ config.name || config.key || `Config #${config.id}` }}</h3>
        <div class="flex gap-2">
          <button v-if="editingId !== config.id" @click="startEdit(config)" class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200">Edit</button>
          <template v-else>
            <button @click="saveConfig" :disabled="loading" class="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 disabled:opacity-50">Save</button>
            <button @click="cancelEdit" class="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200">Cancel</button>
          </template>
        </div>
      </div>
      <div v-if="editingId === config.id">
        <textarea v-model="editForm.value" rows="10" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
      </div>
      <pre v-else class="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-700 overflow-x-auto max-h-48">{{ config.value || JSON.stringify(config, null, 2) }}</pre>
    </div>
  </div>
</template>
