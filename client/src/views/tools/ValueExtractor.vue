<script setup>
import { ref } from 'vue';
import { extractValues } from '../../api/tools';
import PageHeader from '../../components/common/PageHeader.vue';

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
      <PageHeader title="Value Extractor" />
    </div>

    <div class="bg-surface rounded-xl border border-border p-6 mb-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Extract Type</label>
          <select v-model="extractType" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
            <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Unique</label>
          <select v-model="unique" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
            <option value="enabled">Unique Only</option>
            <option value="disabled">Allow Duplicates</option>
          </select>
        </div>
      </div>
      <label class="block text-sm font-medium text-fg-secondary mb-1">Input Text (paste logs, headers, etc.)</label>
      <textarea v-model="text" rows="10" class="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:border-primary outline-none" placeholder="Paste content here..."></textarea>
      <div class="flex justify-end mt-3">
        <button @click="handleExtract" :disabled="loading || !text.trim()" class="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary-muted text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Extracting...' : 'Extract Values' }}
        </button>
      </div>
    </div>

    <div v-if="results !== ''" class="bg-surface rounded-xl border border-border p-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-fg-secondary">Results ({{ count }} items)</h3>
        <button @click="copyResults" class="px-3 py-1.5 bg-surface-alt hover:bg-surface-alt text-fg-secondary text-xs font-medium rounded-lg transition-colors">Copy to Clipboard</button>
      </div>
      <textarea :value="results" readonly rows="12" class="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-surface-alt focus:border-primary outline-none"></textarea>
    </div>
  </div>
</template>
