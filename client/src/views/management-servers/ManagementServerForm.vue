<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getManagementServer, createManagementServer, updateManagementServer } from '../../api/managementServers';
import { getServerProviders } from '../../api/serverProviders';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);
const providers = ref([]);

const form = ref({
  name: '', providerId: '', status: 'Activated', expirationDate: '',
  hostname: '', mainIp: '', sshPort: 22, loginType: 'user-pass',
  username: 'root', password: '', passphrase: '', pemFile: '',
});

onMounted(async () => {
  try {
    const { data } = await getServerProviders({ limit: 100 });
    providers.value = data.data || [];
  } catch (e) { /* ignore */ }

  if (isEdit.value) {
    try {
      const { data } = await getManagementServer(route.params.id);
      form.value = {
        ...form.value, ...data,
        providerId: data.providerId || '',
        sshPort: data.sshPort || 22,
        expirationDate: data.expirationDate ? data.expirationDate.split('T')[0] : '',
      };
    } catch (e) {
      error.value = 'Failed to load server data.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name) { error.value = 'Name is required.'; return; }
  if (!form.value.mainIp) { error.value = 'Main IP is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateManagementServer(route.params.id, form.value);
    } else {
      await createManagementServer(form.value);
    }
    router.push('/management-servers');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save server.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Edit' : 'Add New' }} Management Server</h1>
      <router-link to="/management-servers" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Server Info</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Server Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select v-model="form.providerId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Main IP *</label>
            <input v-model="form.mainIp" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hostname</label>
            <input v-model="form.hostname" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">SSH Port</label>
            <input v-model="form.sshPort" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
            <input v-model="form.expirationDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <h3 class="text-sm font-semibold text-gray-700 mb-3">SSH Access</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Login Type</label>
            <select v-model="form.loginType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="user-pass">Username / Password</option>
              <option value="pem">PEM File</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input v-model="form.username" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div v-if="form.loginType === 'user-pass'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="form.password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div v-if="form.loginType === 'pem'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Passphrase</label>
            <input v-model="form.passphrase" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div v-if="form.loginType === 'pem'" class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">PEM File Content</label>
          <textarea v-model="form.pemFile" rows="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="-----BEGIN RSA PRIVATE KEY-----"></textarea>
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
