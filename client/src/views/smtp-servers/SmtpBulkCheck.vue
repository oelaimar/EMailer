<script setup>
import { ref } from 'vue';
import { bulkCheckSmtpServers } from '../../api/smtpServers';
import PageHeader from '../../components/common/PageHeader.vue';

const input = ref('');
const output = ref('');
const loading = ref(false);

const handleCheck = async () => {
  if (!input.value.trim()) return;
  loading.value = true;
  output.value = '';
  try {
    const lines = input.value.trim().split('\n').filter(Boolean);
    const ids = lines.map((line) => {
      const parts = line.trim().split(/\s+/);
      return parseInt(parts[0], 10);
    }).filter((id) => !isNaN(id));

    if (ids.length === 0) {
      output.value = 'No valid server IDs found. Enter one ID per line.';
      return;
    }

    const { data } = await bulkCheckSmtpServers(ids);
    output.value = data.results.map((r) => `${r.name || r.id}: ${r.status}`).join('\n');
  } catch (e) {
    output.value = e.response?.data?.error || 'Bulk check failed.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <PageHeader title="SMTP Bulk Check" />
    <div class="bg-surface rounded-xl border border-border p-6">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-2">SMTP Server IDs</label>
          <p class="text-xs text-muted mb-2">Enter one server ID per line to check</p>
          <textarea v-model="input" class="w-full border border-border rounded-lg p-3 text-sm font-mono" style="height: 500px" placeholder="1&#10;2&#10;3"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-2">Check Results</label>
          <textarea :value="output" readonly class="w-full border border-border rounded-lg p-3 text-sm font-mono bg-gray-900 text-green-400" style="height: 500px"></textarea>
        </div>
      </div>
      <div class="mt-4">
        <button @click="handleCheck" :disabled="loading" class="px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
          <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? 'Checking...' : 'Check' }}
        </button>
      </div>
    </div>
  </div>
</template>