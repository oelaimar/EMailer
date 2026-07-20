<script setup>
import { ref, onMounted } from 'vue';
import client from '../../api/client';
import { getDataLists } from '../../api/dataLists';
import PageHeader from '../../components/common/PageHeader.vue';

const loading = ref(false);
const error = ref('');
const success = ref('');
const dataLists = ref([]);
const selectedListId = ref(null);
const listInfo = ref(null);

onMounted(async () => {
  try { const { data } = await getDataLists({ limit: 1000 }); dataLists.value = data.data || []; } catch { dataLists.value = []; }
});

const selectList = async () => {
  if (!selectedListId.value) { listInfo.value = null; return; }
  listInfo.value = dataLists.value.find(d => d.id === selectedListId.value);
};

const handleDownload = async () => {
  if (!selectedListId.value) return;
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    const response = await client.get(`/data-lists/${selectedListId.value}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${listInfo.value?.name || 'data-list'}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    success.value = 'Download started.';
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to download.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="Download Data List" />
      <router-link to="/data-lists" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">Back to List</router-link>
    </div>

    <div class="bg-surface rounded-xl border border-border p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Select Data List *</label>
          <select v-model="selectedListId" @change="selectList" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option :value="null">Choose a list...</option>
            <option v-for="l in dataLists" :key="l.id" :value="l.id">{{ l.name }} ({{ l.emailCount }} emails)</option>
          </select>
        </div>

        <div v-if="listInfo" class="bg-surface-alt rounded-lg p-4">
          <h3 class="text-sm font-semibold text-fg-secondary mb-2">List Details</h3>
          <div class="text-sm space-y-1">
            <div><span class="text-muted">Name:</span> {{ listInfo.name }}</div>
            <div><span class="text-muted">Emails:</span> {{ listInfo.emailCount }}</div>
            <div><span class="text-muted">Vertical:</span> {{ listInfo.vertical || 'N/A' }}</div>
            <div><span class="text-muted">ISP:</span> {{ listInfo.isp || 'N/A' }}</div>
            <div><span class="text-muted">Country:</span> {{ listInfo.country || 'N/A' }}</div>
          </div>
        </div>

        <div class="flex items-end">
          <button @click="handleDownload" :disabled="loading || !selectedListId" class="w-full px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Downloading...' : 'Download as CSV' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>