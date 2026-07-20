<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCloudAccount, createCloudAccount, updateCloudAccount } from '../../api/cloudAccounts';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

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
    <PageHeader :title="(isEdit ? 'Edit' : 'Add New') + ' Cloud Account'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-danger-light border border-red-200 text-danger text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Provider *</label>
            <select v-model="form.provider" :disabled="isEdit" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none disabled:bg-surface-alt">
              <option v-for="p in providers" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Account Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
            </select>
          </div>
        </div>

        <h3 class="text-sm font-semibold text-fg-secondary mb-3">API Credentials</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">API Key *</label>
            <input v-model="form.apiKey" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">API Secret *</label>
            <input v-model="form.apiSecret" type="password" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <h3 class="text-sm font-semibold text-fg-secondary mb-3">Proxy (Optional)</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Proxy IP</label>
            <input v-model="form.proxyIp" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Proxy Port</label>
            <input v-model="form.proxyPort" type="number" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Proxy Username</label>
            <input v-model="form.proxyUsername" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Proxy Password</label>
            <input v-model="form.proxyPassword" type="password" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <FormActions back-to="/cloud-accounts" :saving="loading" />
      </form>
    </FormCard>
  </div>
</template>
