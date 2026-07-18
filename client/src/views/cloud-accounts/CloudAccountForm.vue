<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCloudAccount, createCloudAccount, updateCloudAccount } from '../../api/cloudAccounts';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);

const providers = [
  { value: 'aws', label: 'Amazon AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'do', label: 'Digital Ocean' },
  { value: 'hetzner', label: 'Hetzner' },
  { value: 'linode', label: 'Linode' },
  { value: 'ovh', label: 'OVH' },
  { value: 'scaleway', label: 'Scaleway' },
  { value: 'vultr', label: 'Vultr' },
  { value: 'atlantic', label: 'Atlantic' },
  { value: 'idcloud', label: 'IDCloud Host' },
  { value: 'google', label: 'Google Cloud' },
];

const form = ref({
  provider: 'aws', name: '', status: 'Activated',
  apiKey: '', apiSecret: '',
  proxyIp: '', proxyPort: '', proxyUsername: '', proxyPassword: '',
  providerConfig: null,
});

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await getCloudAccount(route.params.id);
      form.value = {
        ...form.value, ...data,
        proxyPort: data.proxyPort || '',
        providerConfig: data.providerConfig || null,
      };
    } catch (e) {
      error.value = 'Failed to load account data.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name) { error.value = 'Account name is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateCloudAccount(route.params.id, form.value);
    } else {
      await createCloudAccount(form.value);
    }
    router.push('/cloud-accounts');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save account.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Edit' : 'Add New' }} Cloud Account</h1>
      <router-link to="/cloud-accounts" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
            <select v-model="form.provider" :disabled="isEdit" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100">
              <option v-for="p in providers" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
            </select>
          </div>
        </div>

        <h3 class="text-sm font-semibold text-gray-700 mb-3">API Credentials</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">API Key *</label>
            <input v-model="form.apiKey" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">API Secret *</label>
            <input v-model="form.apiSecret" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <h3 class="text-sm font-semibold text-gray-700 mb-3">Proxy (Optional)</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Proxy IP</label>
            <input v-model="form.proxyIp" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Proxy Port</label>
            <input v-model="form.proxyPort" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Proxy Username</label>
            <input v-model="form.proxyUsername" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Proxy Password</label>
            <input v-model="form.proxyPassword" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
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
