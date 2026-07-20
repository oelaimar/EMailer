<script setup>
import { ref, onMounted } from 'vue';
import client from '../../api/client';
import PageHeader from '../../components/common/PageHeader.vue';

const loading = ref(false);
const error = ref('');
const success = ref('');
const smtpGroups = ref([]);
const offers = ref([]);

const form = ref({
  smtpGroupId: '',
  offerId: '',
  subject: '',
  fromName: '',
  body: '',
  recipients: '',
  isp: '',
  linkType: 'routing',
  transferEncoding: '7bit',
  headersRotation: '',
  numberOfEmails: 100,
  emailsPeriodValue: 100,
  emailsPeriodType: 'Milliseconds',
});

onMounted(async () => {
  try {
    const { data } = await client.get('/gsuite-accounts/send-process-data');
    smtpGroups.value = data.smtpGroups || [];
    offers.value = data.offers || [];
  } catch { /* ignore */ }
});

const handleSend = async (action) => {
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    await client.post('/gsuite-accounts/send', { ...form.value, action, type: 'gsuite' });
    success.value = 'GSuite ' + action + ' initiated.';
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
      <PageHeader title="GSuite Send Process" />
      <router-link to="/gsuite-accounts" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">Back</router-link>
    </div>

    <div class="bg-surface rounded-xl border border-border p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">SMTP Group</label>
          <select v-model="form.smtpGroupId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Select...</option>
            <option v-for="g in smtpGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Offer</label>
          <select v-model="form.offerId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Select...</option>
            <option v-for="o in offers" :key="o.id" :value="o.id">{{ o.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Transfer Encoding</label>
          <select v-model="form.transferEncoding" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="7bit">7bit</option>
            <option value="8bit">8bit</option>
            <option value="quoted-printable">Quoted-Printable</option>
            <option value="base64">Base64</option>
            <option value="binary">Binary</option>
          </select>
        </div>
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
        <textarea v-model="form.body" rows="6" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email body..."></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-fg-secondary mb-1">Recipients (one per line)</label>
        <textarea v-model="form.recipients" rows="5" class="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
      </div>

      <div class="flex justify-end gap-3">
        <button @click="handleSend('test')" :disabled="loading" class="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Sending...' : 'Send Test' }}
        </button>
        <button @click="handleSend('drop')" :disabled="loading" class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Sending...' : 'Send Drop' }}
        </button>
      </div>
    </div>
  </div>
</template>
