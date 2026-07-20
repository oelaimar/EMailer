<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSmtpServer, createSmtpServer, updateSmtpServer } from '../../api/smtpServers';
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
  name: '',
  host: '',
  port: 25,
  encryption: 'None',
  status: 'Activated',
  username: '',
  password: '',
  proxyIp: '',
  proxyPort: '',
  proxyUsername: '',
  proxyPassword: '',
  expirationDate: new Date().toISOString().split('T')[0],
});

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true;
    try {
      const { data } = await getSmtpServer(route.params.id);
      form.value = { ...form.value, ...data, expirationDate: data.expirationDate?.split('T')[0] || form.value.expirationDate };
    } catch (e) {
      error.value = 'Failed to load SMTP server.';
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
      await updateSmtpServer(route.params.id, form.value);
    } else {
      await createSmtpServer(form.value);
    }
    router.push('/smtp-servers');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save.';
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl">
    <PageHeader :title="isEdit ? 'Edit SMTP Server' : 'Add New SMTP Server'" />

    <div v-if="loading" class="text-center py-12 text-muted">Loading...</div>

    <form v-else @submit.prevent="handleSubmit">
      <FormCard>
        <div v-if="error" class="mb-4 p-3 bg-danger-light border border-red-200 rounded-lg text-danger text-sm">{{ error }}</div>

        <h3 class="text-sm font-semibold text-fg-secondary uppercase mb-4">Server Info</h3>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Server Name *</label>
            <input v-model="form.name" required class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Host *</label>
            <input v-model="form.host" required class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">SMTP Port *</label>
            <input v-model.number="form.port" type="number" required class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Encryption</label>
            <select v-model="form.encryption" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option>None</option>
              <option>SSL</option>
              <option>TLS</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option>Activated</option>
              <option>Inactivated</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Expiration Date *</label>
            <input v-model="form.expirationDate" type="date" required class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <h3 class="text-sm font-semibold text-fg-secondary uppercase mb-4">Default SMTP User Info</h3>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Username</label>
            <input v-model="form.username" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Password</label>
            <input v-model="form.password" type="password" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Proxy IP</label>
            <input v-model="form.proxyIp" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Proxy Port</label>
            <input v-model="form.proxyPort" type="number" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Proxy Username</label>
            <input v-model="form.proxyUsername" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Proxy Password</label>
            <input v-model="form.proxyPassword" type="password" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <FormActions back-to="/smtp-servers" :saving="saving" />
      </FormCard>
    </form>
  </div>
</template>
