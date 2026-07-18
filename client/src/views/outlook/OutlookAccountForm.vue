<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOutlookAccount, createOutlookAccount, updateOutlookAccount } from '../../api/outlookAccounts';

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const saving = ref(false);
const error = ref('');

const form = ref({
  email: '',
  clientId: '',
  clientSecret: '',
  refreshToken: '',
  tenantId: '',
});

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true;
    try {
      const { data } = await getOutlookAccount(route.params.id);
      form.value = { ...form.value, ...data };
    } catch (e) {
      error.value = 'Failed to load Outlook account.';
    } finally {
      loading.value = false;
    }
  }
});

const handleSubmit = async () => {
  error.value = '';
  saving.value = true;
  try {
    if (isEdit.value) {
      await updateOutlookAccount(route.params.id, form.value);
    } else {
      await createOutlookAccount(form.value);
    }
    router.push('/outlook-accounts');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save.';
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Edit Outlook Account' : 'Add New Outlook Account' }}</h1>
      <router-link to="/outlook-accounts" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back to List</router-link>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">Loading...</div>

    <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <h3 class="text-sm font-semibold text-gray-700 uppercase mb-4">Account Info</h3>
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input v-model="form.email" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
          <input v-model="form.clientId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
          <input v-model="form.clientSecret" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label>
          <input v-model="form.refreshToken" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tenant ID</label>
          <input v-model="form.tenantId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      <button type="submit" :disabled="saving" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
        <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </form>
  </div>
</template>
