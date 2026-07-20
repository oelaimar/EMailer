<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOutlookAccount, createOutlookAccount, updateOutlookAccount } from '../../api/outlookAccounts';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

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
    <PageHeader :title="isEdit ? 'Edit Outlook Account' : 'Add New Outlook Account'" />

    <div v-if="loading" class="text-center py-12 text-muted">Loading...</div>

    <form v-else @submit.prevent="handleSubmit">
      <FormCard>
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

        <h3 class="text-sm font-semibold text-fg-secondary uppercase mb-4">Account Info</h3>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Email *</label>
            <input v-model="form.email" type="email" required class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Client ID</label>
            <input v-model="form.clientId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Client Secret</label>
            <input v-model="form.clientSecret" type="password" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Refresh Token</label>
            <input v-model="form.refreshToken" type="password" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Tenant ID</label>
            <input v-model="form.tenantId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <FormActions back-to="/outlook-accounts" :saving="saving" submit-label="Save" />
      </FormCard>
    </form>
  </div>
</template>
