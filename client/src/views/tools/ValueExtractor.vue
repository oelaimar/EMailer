<script setup>
import { ref } from 'vue';
import { extractValues } from '../../api/tools';

const loading = ref(false);
const error = ref('');
const extractType = ref('all-ips');
const unique = ref('enabled');
const text = ref('');
const results = ref('');
const count = ref(0);

const types = [
  { value: 'all-ips', label: 'All IPs (IPv4 + IPv6)' },
  { value: 'all-ips-v4', label: 'IPv4 Only' },
  { value: 'all-ips-v6', label: 'IPv6 Only' },
  { value: 'all-emails', label: 'All Emails' },
  { value: 'all-senders', label: 'All Senders (From header)' },
];

const handleExtract = async () => {
  if (!text.value.trim()) return;
  loading.value = true;
  error.value = '';
  results.value = '';
  count.value = 0;
  try {
    const { data } = await extractValues(extractType.value, unique.value, text.value);
    results.value = data.results || '';
    count.value = data.count || 0;
  } catch (e) {
    error.value = e.response?.data?.error || 'Extraction failed.';
  } finally {
    loading.value = false;
  }
};

const copyResults = () => {
  navigator.clipboard.writeText(results.value);
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Value Extractor</h1>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Extract Type</label>
          <select v-model="extractType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Unique</label>
          <select v-model="unique" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="enabled">Unique Only</option>
            <option value="disabled">Allow Duplicates</option>
          </select>
        </div>
      </div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Input Text (paste logs, headers, etc.)</label>
      <textarea v-model="text" rows="10" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Paste content here..."></textarea>
      <div class="flex justify-end mt-3">
        <button @click="handleExtract" :disabled="loading || !text.trim()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Extracting...' : 'Extract Values' }}
        </button>
      </div>
    </div>

    <div v-if="results !== ''" class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-700">Results ({{ count }} items)</h3>
        <button @click="copyResults" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors">Copy to Clipboard</button>
      </div>
      <textarea :value="results" readonly rows="12" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
    </div>
  </div>
</template>
