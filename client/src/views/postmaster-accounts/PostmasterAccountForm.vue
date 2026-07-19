<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPostmasterAccount, createPostmasterAccount, updatePostmasterAccount } from '../../api/postmasterAccounts';
import { testPostmasterConnection } from '../../api/postmaster';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);

const form = ref({
  domain: '', serverName: '', providerName: '',
  imapHost: '', imapPort: '', smtpHost: '', smtpPort: '',
  username: '', password: '', status: 'Activated',
});
const testing = ref(false);
const testResult = ref(null);

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await getPostmasterAccount(route.params.id);
      form.value = {
        ...form.value, ...data,
        imapPort: data.imapPort || '',
        smtpPort: data.smtpPort || '',
      };
    } catch (e) {
      error.value = 'Failed to load postmaster account.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.domain) { error.value = 'Domain is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updatePostmasterAccount(route.params.id, form.value);
    } else {
      await createPostmasterAccount(form.value);
    }
    router.push('/postmaster-accounts');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save account.';
  } finally {
    loading.value = false;
  }
};

const testConnection = async () => {
  if (!isEdit.value) return;
  testing.value = true;
  testResult.value = null;
  try {
    const { data } = await testPostmasterConnection(route.params.id);
    testResult.value = data;
  } catch (e) {
    testResult.value = { success: false, message: e.response?.data?.error || 'Connection test failed.' };
  } finally {
    testing.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Edit' : 'Add New' }} Postmaster Account</h1>
      <router-link to="/postmaster-accounts" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Account Info</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Domain *</label>
            <input v-model="form.domain" type="text" placeholder="example.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Server Name</label>
            <input v-model="form.serverName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
            <input v-model="form.providerName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <h3 class="text-sm font-semibold text-gray-700 mb-3">IMAP Settings</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">IMAP Host</label>
            <input v-model="form.imapHost" type="text" placeholder="imap.example.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">IMAP Port</label>
            <input v-model="form.imapPort" type="number" placeholder="993" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <div v-if="isEdit" class="mb-6">
          <button type="button" @click="testConnection" :disabled="testing" class="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
            {{ testing ? 'Testing...' : 'Test Connection' }}
          </button>
          <span v-if="testResult" :class="['ml-3 text-sm', testResult.success ? 'text-green-600' : 'text-red-600']">
            {{ testResult.message }}
          </span>
        </div>

        <h3 class="text-sm font-semibold text-gray-700 mb-3">SMTP Settings</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
            <input v-model="form.smtpHost" type="text" placeholder="smtp.example.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
            <input v-model="form.smtpPort" type="number" placeholder="587" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <h3 class="text-sm font-semibold text-gray-700 mb-3">Credentials</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input v-model="form.username" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="form.password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="loading" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
