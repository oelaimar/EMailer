<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getRegistrarAccount, createRegistrarAccount, updateRegistrarAccount } from '../../api/registrarAccounts';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);

const registrars = [
  { value: 'cloudflare', label: 'Cloudflare' },
  { value: 'godaddy', label: 'GoDaddy' },
  { value: 'namecheap', label: 'Namecheap' },
  { value: 'namecom', label: 'Name.com' },
  { value: 'dynadot', label: 'Dynadot' },
  { value: 'spaceship', label: 'Spaceship' },
];

const form = ref({
  registrar: 'cloudflare', name: '', status: 'Activated',
  apiKey: '', apiSecret: '', apiToken: '', username: '', password: '',
});

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await getRegistrarAccount(route.params.id);
      form.value = { ...form.value, ...data };
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
      await updateRegistrarAccount(route.params.id, form.value);
    } else {
      await createRegistrarAccount(form.value);
    }
    router.push('/registrar-accounts');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save account.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <PageHeader :title="isEdit ? 'Edit Registrar Account' : 'Add New Registrar Account'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Registrar *</label>
            <select v-model="form.registrar" :disabled="isEdit" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none disabled:bg-surface-alt">
              <option v-for="r in registrars" :key="r.value" :value="r.value">{{ r.label }}</option>
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
            <label class="block text-sm font-medium text-fg-secondary mb-1">API Key</label>
            <input v-model="form.apiKey" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">API Secret</label>
            <input v-model="form.apiSecret" type="password" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">API Token</label>
            <input v-model="form.apiToken" type="password" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Username</label>
            <input v-model="form.username" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <FormActions back-to="/registrar-accounts" :saving="loading" submit-label="Save" />
      </form>
    </FormCard>
  </div>
</template>
