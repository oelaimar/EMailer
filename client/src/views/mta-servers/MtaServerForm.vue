<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getMtaServer, createMtaServer, updateMtaServer } from '../../api/mtaServers';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);

const form = ref({
  name: '',
  mainIp: '',
  hostname: '',
  sshPort: 22,
  os: 'ubuntu',
  loginType: 'user-pass',
  username: 'root',
  password: '',
  status: 'Activated',
  expirationDate: '',
  country: '',
});

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await getMtaServer(route.params.id);
      form.value = { ...form.value, ...data, expirationDate: data.expirationDate ? data.expirationDate.split('T')[0] : '' };
    } catch (e) {
      error.value = 'Failed to load server data.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name || !form.value.mainIp) {
    error.value = 'Name and Main IP are required.';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateMtaServer(route.params.id, form.value);
    } else {
      await createMtaServer(form.value);
    }
    router.push('/mta-servers');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save server.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <PageHeader :title="(isEdit ? 'Edit' : 'Add New') + ' MTA Server'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-danger-light border border-red-200 text-danger text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Server Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" placeholder="Enter Server Name" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Expiration Date</label>
            <input v-model="form.expirationDate" type="date" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Main IP *</label>
            <input v-model="form.mainIp" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" placeholder="Enter Main IP" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Hostname</label>
            <input v-model="form.hostname" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" placeholder="Optional" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">SSH Port</label>
            <input v-model.number="form.sshPort" type="number" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">OS</label>
            <select v-model="form.os" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="ubuntu">Ubuntu</option>
              <option value="centos">Centos</option>
              <option value="debian">Debian</option>
              <option value="rocky">Rocky Linux</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Login Type</label>
            <select v-model="form.loginType" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="user-pass">Username/Password</option>
              <option value="pem">Pem File</option>
              <option value="rsa">RSA Connection</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Username</label>
            <input v-model="form.username" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Password</label>
            <input v-model="form.password" type="password" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" placeholder="Enter Password" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Country</label>
            <input v-model="form.country" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" placeholder="Optional" />
          </div>
        </div>

        <FormActions back-to="/mta-servers" :saving="loading" />
      </form>
    </FormCard>
  </div>
</template>
