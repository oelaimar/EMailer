<script setup>
import { ref } from 'vue';
import { spfCheck } from '../../api/tools';
import PageHeader from '../../components/common/PageHeader.vue';

const loading = ref(false);
const error = ref('');
const domains = ref('');
const results = ref([]);

const handleCheck = async () => {
  if (!domains.value.trim()) return;
  loading.value = true;
  error.value = '';
  results.value = [];
  try {
    const { data } = await spfCheck(domains.value);
    results.value = data.results || [];
  } catch (e) {
    error.value = e.response?.data?.error || 'SPF check failed.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="SPF Lookup" />
    </div>

    <div class="bg-surface rounded-xl border border-border p-6 mb-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <label class="block text-sm font-medium text-fg-secondary mb-1">Domains (one per line)</label>
      <textarea v-model="domains" rows="6" class="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:border-primary outline-none" placeholder="example.com&#10;another.com"></textarea>
      <div class="flex justify-end mt-3">
        <button @click="handleCheck" :disabled="loading || !domains.trim()" class="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary-muted text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Checking...' : 'Check SPF' }}
        </button>
      </div>
    </div>

    <div v-if="results.length" class="bg-surface rounded-xl border border-border overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-surface-alt border-b border-border">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-muted">Domain</th>
            <th class="px-4 py-3 text-left font-medium text-muted">SPF Record</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in results" :key="r.domain" class="hover:bg-surface-alt">
            <td class="px-4 py-3 font-medium text-fg">{{ r.domain }}</td>
            <td class="px-4 py-3 text-muted font-mono text-xs break-all">{{ r.spf }}</td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', r.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' : r.status === 'Fail' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700']">
                {{ r.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
