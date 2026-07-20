<script setup>
import { ref, onMounted } from 'vue';
import { extractMailbox } from '../../api/tools';
import { getMailboxes } from '../../api/mailboxes';
import { useToastStore } from '../../stores/toast';
import PageHeader from '../../components/common/PageHeader.vue';
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
      <PageHeader title="Mailbox Extractor" />
    </div>

    <div class="bg-surface rounded-xl border border-border p-6 mb-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Mailbox *</label>
          <select v-model="mailboxId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
            <option value="">Select mailbox...</option>
            <option v-for="m in mailboxes" :key="m.id" :value="m.id">{{ m.name }} ({{ m.username }})</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Max Emails</label>
          <input v-model.number="limit" type="number" min="1" max="500" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
        </div>
      </div>

      <div class="flex justify-end">
        <button @click="handleExtract" :disabled="loading || !mailboxId" class="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary-muted text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Extracting...' : 'Extract Emails' }}
        </button>
      </div>
    </div>

    <div v-if="results.length" class="bg-surface rounded-xl border border-border overflow-hidden">
      <div class="px-4 py-3 bg-surface-alt border-b border-border font-medium text-fg-secondary text-sm">Results — {{ total }} emails extracted</div>
      <div class="max-h-96 overflow-y-auto">
        <div v-for="(email, idx) in results" :key="idx" class="px-4 py-2 border-b border-border-light text-sm text-fg-secondary font-mono">
          {{ email }}
        </div>
      </div>
    </div>
  </div>
</template>
