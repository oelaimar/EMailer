<script setup>
import { ref, onMounted } from 'vue';
import client from '../../api/client';
import PageHeader from '../../components/common/PageHeader.vue';

const loading = ref(false);
const error = ref('');
const success = ref('');
const groups = ref([]);
const selectedGroupId = ref('');

const form = ref({
  recipients: '',
  subject: '',
  fromName: '',
  body: '',
  action: 'test',
});

onMounted(async () => {
  try {
    const { data } = await client.get('/smtp-groups', { params: { limit: 500 } });
    groups.value = data.data || [];
  } catch { error.value = 'Failed to load SMTP groups.'; }
});

const handleSend = async () => {
  if (!selectedGroupId.value) { error.value = 'Please select an SMTP group.'; return; }
  if (!form.value.recipients) { error.value = 'Recipients are required.'; return; }
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    await client.post(`/smtp-groups/${selectedGroupId.value}/send-process`, form.value);
    success.value = `Send ${form.value.action} initiated successfully.`;
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to send.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="SMTP Send Process" />
      <router-link to="/smtp-groups" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">Back</router-link>
    </div>

    <div class="bg-surface rounded-xl border border-border p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-fg-secondary mb-1">SMTP Group *</label>
        <select v-model="selectedGroupId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Select a group...</option>
          <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }} ({{ g.encryption }})</option>
        </select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Subject</label>
          <input v-model="form.subject" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email subject" />
        </div>
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">From Name</label>
          <input v-model="form.fromName" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Sender name" />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-fg-secondary mb-1">Email Body</label>
        <textarea v-model="form.body" rows="6" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email body content..."></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-fg-secondary mb-1">Recipients (one per line) *</label>
        <textarea v-model="form.recipients" rows="6" class="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="user1@example.com&#10;user2@example.com"></textarea>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex gap-2">
          <label v-for="act in ['test', 'drop']" :key="act" :class="['px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors', form.action === act ? 'bg-primary text-white' : 'bg-surface-alt text-fg-secondary hover:bg-border']">
            <input type="radio" v-model="form.action" :value="act" class="hidden" />
            {{ act === 'test' ? 'Send Test' : 'Send Drop' }}
          </label>
        </div>
        <button @click="handleSend" :disabled="loading" class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Sending...' : 'Send Now' }}
        </button>
      </div>
    </div>
  </div>
</template>