<script setup>
import { ref, onMounted } from 'vue';
import client from '../../api/client';
import { getDataLists } from '../../api/dataLists';
import { getMailboxes } from '../../api/mailboxes';

const loading = ref(false);
const error = ref('');
const success = ref('');
const mailboxes = ref([]);
const dataLists = ref([]);

const form = ref({
  mailboxId: '',
  dataListId: '',
  imapServer: '',
  imapPort: 993,
  folder: 'INBOX',
  fetchLimit: 1000,
});

onMounted(async () => {
  try {
    const [mbRes, dlRes] = await Promise.all([
      getMailboxes({ limit: 1000 }),
      getDataLists({ limit: 1000 }),
    ]);
    mailboxes.value = mbRes.data.data || [];
    dataLists.value = dlRes.data.data || [];
  } catch { /* ignore */ }
});

const handleFetch = async () => {
  if (!form.value.mailboxId || !form.value.dataListId) {
    error.value = 'Select a mailbox and data list.';
    return;
  }
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    const { data } = await client.post('/data-lists/fetch-emails', form.value);
    success.value = data.message || 'Email fetch initiated.';
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to start fetch.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Emails Fetch</h1>
      <router-link to="/data-lists" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back to List</router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Source Mailbox *</label>
          <select v-model="form.mailboxId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Select mailbox...</option>
            <option v-for="m in mailboxes" :key="m.id" :value="m.id">{{ m.email || m.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Data List *</label>
          <select v-model="form.dataListId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Select data list...</option>
            <option v-for="l in dataLists" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">IMAP Server</label>
          <input v-model="form.imapServer" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="imap.example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">IMAP Port</label>
          <input v-model.number="form.imapPort" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Folder</label>
          <input v-model="form.folder" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fetch Limit</label>
          <input v-model.number="form.fetchLimit" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      <div class="flex justify-end">
        <button @click="handleFetch" :disabled="loading" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Fetching...' : 'Start Fetch' }}
        </button>
      </div>
    </div>
  </div>
</template>
