<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { multiAddMtaServers } from '../../api/mtaServers';
import { getServerProviders } from '../../api/serverProviders';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const providers = ref([]);

const form = ref({
  prefix: '',
  serverProviderId: '',
  os: 'ubuntu',
  username: 'root',
  password: '',
  mainIps: '',
});

onMounted(async () => {
  try {
    const { data } = await getServerProviders({ limit: 1000 });
    providers.value = data.data || [];
  } catch { providers.value = []; }
});

const ipCount = ref(0);
const updateIpCount = () => {
  ipCount.value = form.value.mainIps.split('\n').map(l => l.trim()).filter(Boolean).length;
};

const handleSubmit = async () => {
  if (!form.value.prefix || !form.value.mainIps) {
    error.value = 'Prefix and Main IPs list are required.';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    await multiAddMtaServers(form.value);
    router.push('/mta-servers');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to create servers.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Multi-Add MTA Servers</h1>
      <router-link to="/mta-servers" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Server Prefix Name *</label>
            <input v-model="form.prefix" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. mta-prod" />
            <p class="text-xs text-gray-500 mt-1">Servers will be named: prefix-001, prefix-002, etc.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Server Provider</label>
            <select v-model="form.serverProviderId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">OS</label>
            <select v-model="form.os" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="ubuntu">Ubuntu</option>
              <option value="centos">Centos</option>
              <option value="debian">Debian</option>
              <option value="rocky">Rocky Linux</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input v-model="form.username" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="form.password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter Password" />
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Main IPs List * (one per line)</label>
          <textarea v-model="form.mainIps" @input="updateIpCount" rows="8" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="192.168.1.1&#10;192.168.1.2&#10;192.168.1.3"></textarea>
          <p class="text-xs text-gray-500 mt-1">{{ ipCount }} IP(s) detected</p>
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="loading" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Creating...' : `Create ${ipCount} Server(s)` }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
