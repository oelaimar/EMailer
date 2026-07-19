<script setup>
import { ref } from 'vue';
import { extractMailbox } from '../../api/tools';

const loading = ref(false);
const error = ref('');
const form = ref({
  mailboxes: '',
  folder: 'INBOX',
  maxEmails: '100',
  order: 'desc',
  returnType: 'json',
  filters: '',
});
const results = ref([]);
const total = ref(0);

const handleExtract = async () => {
  if (!form.value.mailboxes.trim()) return;
  loading.value = true;
  error.value = '';
  results.value = [];
  total.value = 0;
  try {
    const { data } = await extractMailbox(form.value);
    results.value = data.results || [];
    total.value = data.total || 0;
  } catch (e) {
    error.value = e.response?.data?.error || 'Mailbox extraction failed.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Mailbox Extractor</h1>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Folder</label>
          <input v-model="form.folder" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Max Emails</label>
          <input v-model="form.maxEmails" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Order</label>
          <select v-model="form.order" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Return Type</label>
          <select v-model="form.returnType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Mailboxes (one per line, format: email@domain.com)</label>
        <textarea v-model="form.mailboxes" rows="5" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="user1@example.com&#10;user2@example.com"></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Filters (optional)</label>
        <input v-model="form.filters" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="subject:keyword OR from:sender@domain.com" />
      </div>

      <div class="flex justify-end">
        <button @click="handleExtract" :disabled="loading || !form.mailboxes.trim()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Extracting...' : 'Extract Emails' }}
        </button>
      </div>
    </div>

    <div v-if="results.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-sm">Results ({{ total }} mailboxes)</div>
      <div class="divide-y divide-gray-100">
        <div v-for="r in results" :key="r.mailbox" class="px-4 py-3">
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-800 text-sm">{{ r.mailbox }}</span>
            <span class="text-xs text-gray-500">{{ r.emails?.length || 0 }} emails</span>
          </div>
          <p class="text-sm text-gray-500 mt-1">{{ r.status }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
