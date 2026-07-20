<script setup>
import { ref, onMounted } from 'vue';
import { extractMailbox } from '../../api/tools';
import { getMailboxes } from '../../api/mailboxes';
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();

const loading = ref(false);
const error = ref('');
const mailboxId = ref('');
const limit = ref(100);
const mailboxes = ref([]);
const results = ref([]);
const total = ref(0);

onMounted(async () => {
  try {
    const { data } = await getMailboxes({ limit: 1000 });
    mailboxes.value = data.data || [];
  } catch (e) {
    toastStore.showToast('Failed to load data', 'error');
  }
});

const handleExtract = async () => {
  if (!mailboxId.value) return;
  loading.value = true;
  error.value = '';
  results.value = [];
  total.value = 0;
  try {
    const { data } = await extractMailbox({ mailboxId: parseInt(mailboxId.value, 10), limit: limit.value });
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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mailbox *</label>
          <select v-model="mailboxId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Select mailbox...</option>
            <option v-for="m in mailboxes" :key="m.id" :value="m.id">{{ m.name }} ({{ m.username }})</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Max Emails</label>
          <input v-model.number="limit" type="number" min="1" max="500" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      <div class="flex justify-end">
        <button @click="handleExtract" :disabled="loading || !mailboxId" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Extracting...' : 'Extract Emails' }}
        </button>
      </div>
    </div>

    <div v-if="results.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-sm">Results — {{ total }} emails extracted</div>
      <div class="max-h-96 overflow-y-auto">
        <div v-for="(email, idx) in results" :key="idx" class="px-4 py-2 border-b border-gray-50 text-sm text-gray-700 font-mono">
          {{ email }}
        </div>
      </div>
    </div>
  </div>
</template>
