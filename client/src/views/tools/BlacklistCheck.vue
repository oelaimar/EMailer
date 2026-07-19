<script setup>
import { ref } from 'vue';
import { blacklistCheck } from '../../api/tools';

const loading = ref(false);
const error = ref('');
const checkType = ref('ips');
const text = ref('');
const results = ref([]);

const handleCheck = async () => {
  if (!text.value.trim()) return;
  loading.value = true;
  error.value = '';
  results.value = [];
  try {
    const { data } = await blacklistCheck(checkType.value, text.value);
    results.value = data.results || [];
  } catch (e) {
    error.value = e.response?.data?.error || 'Blacklist check failed.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Blacklist Check</h1>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Check Type</label>
          <select v-model="checkType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="ips">IP Addresses</option>
            <option value="domains">Domains</option>
          </select>
        </div>
      </div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ checkType === 'ips' ? 'IP Addresses' : 'Domains' }} (one per line)</label>
      <textarea v-model="text" rows="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1.2.3.4&#10;5.6.7.8"></textarea>
      <div class="flex justify-end mt-3">
        <button @click="handleCheck" :disabled="loading || !text.trim()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Checking...' : 'Check Blacklists' }}
        </button>
      </div>
    </div>

    <div v-if="results.length" class="space-y-4">
      <div v-for="r in results" :key="r.item" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-800">{{ r.item }}</div>
        <div class="p-4">
          <div v-if="r.results && r.results[0]?.note" class="text-sm text-gray-500 italic">{{ r.results[0].note }}</div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div v-for="bl in r.results" :key="bl.blacklist" class="flex items-center gap-2">
              <span :class="['w-2 h-2 rounded-full flex-shrink-0', bl.status === 'Clean' ? 'bg-emerald-500' : 'bg-red-500']"></span>
              <span class="text-sm text-gray-700 truncate" :title="bl.blacklist">{{ bl.blacklist }}</span>
              <span :class="['text-xs font-medium', bl.status === 'Clean' ? 'text-emerald-600' : 'text-red-600']">{{ bl.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
