<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import client from '../../api/client';
import { getSmtpGroups } from '../../api/smtpGroups';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const success = ref('');
const groupId = route.params.id;
const group = ref(null);

const form = ref({
  recipients: '',
  subject: '',
  fromName: '',
  body: '',
  action: 'test',
});

onMounted(async () => {
  try {
    const { data } = await client.get(`/smtp-groups/${groupId}`);
    group.value = data;
  } catch { error.value = 'Failed to load SMTP group.'; }
});

const handleSend = async () => {
  if (!form.value.recipients) { error.value = 'Recipients are required.'; return; }
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    await client.post(`/smtp-groups/${groupId}/send-process`, form.value);
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
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Send Process</h1>
        <p v-if="group" class="text-sm text-gray-500">{{ group.name }} — {{ group.encryption }}</p>
      </div>
      <router-link to="/smtp-groups" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back to List</router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input v-model="form.subject" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email subject" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">From Name</label>
          <input v-model="form.fromName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Sender name" />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
        <textarea v-model="form.body" rows="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email body content..."></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Recipients (one per line) *</label>
        <textarea v-model="form.recipients" rows="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="user1@example.com&#10;user2@example.com"></textarea>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex gap-2">
          <label v-for="act in ['test', 'drop']" :key="act" :class="['px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors', form.action === act ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']">
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
