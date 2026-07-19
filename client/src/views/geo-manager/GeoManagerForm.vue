<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getGeoManagerProcess, createGeoManagerProcess } from '../../api/geoManager';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const error = ref('');
const isEdit = ref(false);

const form = ref({
  name: '',
  targetRows: 0,
  targetGeos: '',
  batchSize: 500,
  tablePattern: 'e_',
  duplicateMode: 'delete',
  scheduledAt: '',
});

onMounted(async () => {
  if (route.params.id) {
    isEdit.value = true;
    try {
      const { data } = await getGeoManagerProcess(route.params.id);
      form.value = {
        name: data.name || '',
        targetRows: data.targetRows || 0,
        targetGeos: Array.isArray(data.targetGeos) ? data.targetGeos.join('\n') : (data.targetGeos || ''),
        batchSize: data.batchSize || 500,
        tablePattern: data.tablePattern || 'e_',
        duplicateMode: data.duplicateMode || 'delete',
        scheduledAt: data.scheduledAt ? data.scheduledAt.slice(0, 16) : '',
      };
    } catch (e) {
      error.value = 'Failed to load process.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name.trim()) return;
  loading.value = true;
  error.value = '';
  try {
    const payload = {
      ...form.value,
      targetGeos: form.value.targetGeos ? form.value.targetGeos.split('\n').map((g) => g.trim()).filter(Boolean) : [],
      targetRows: parseInt(form.value.targetRows, 10) || 0,
      batchSize: parseInt(form.value.batchSize, 10) || 500,
    };
    await createGeoManagerProcess(payload);
    router.push('/geo-manager');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save process.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Edit Process' : 'New Geo Manager Process' }}</h1>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Target Rows</label>
            <input v-model="form.targetRows" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Batch Size</label>
            <input v-model="form.batchSize" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Table Pattern</label>
            <input v-model="form.tablePattern" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Duplicate Mode</label>
            <select v-model="form.duplicateMode" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="delete">Delete Duplicates</option>
              <option value="keep">Keep Duplicates</option>
              <option value="flag">Flag Duplicates</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Scheduled At</label>
            <input v-model="form.scheduledAt" type="datetime-local" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Geos (one per line, e.g. US, UK, CA)</label>
          <textarea v-model="form.targetGeos" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="US&#10;UK&#10;CA"></textarea>
        </div>

        <div class="flex justify-end gap-3">
          <button type="button" @click="router.push('/geo-manager')" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">Cancel</button>
          <button type="submit" :disabled="loading || !form.name.trim()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Saving...' : 'Save Process' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
