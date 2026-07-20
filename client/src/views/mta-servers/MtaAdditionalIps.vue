<script setup>
import { ref, onMounted } from 'vue';
import { getMtaServers, configureAdditionalIps } from '../../api/mtaServers';
import PageHeader from '../../components/common/PageHeader.vue';

const loading = ref(false);
const error = ref('');
const success = ref('');
const servers = ref([]);
const selectedServerId = ref(null);
const lines = ref('');

onMounted(async () => {
  try {
    const { data } = await getMtaServers({ limit: 1000, status: 'Activated' });
    servers.value = data.data || [];
  } catch { servers.value = []; }
});

const selectedOs = ref('ubuntu');

const handleServerChange = () => {
  const server = servers.value.find(s => s.id === selectedServerId.value);
  if (server) selectedOs.value = server.os;
};

const handleConfigure = async () => {
  if (!selectedServerId.value || !lines.value.trim()) {
    error.value = 'Select a server and enter IP lines.';
    return;
  }
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    await configureAdditionalIps(selectedServerId.value, { lines: lines.value });
    success.value = 'IPs configured successfully.';
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to configure IPs.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="Configure Additional IPs" />
      <router-link to="/mta-servers" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-surface rounded-xl border border-border p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">Select Server</label>
          <select v-model="selectedServerId" @change="handleServerChange" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option :value="null">Select a server...</option>
            <option v-for="s in servers" :key="s.id" :value="s.id">{{ s.name }} ({{ s.mainIp }}) — {{ s.os }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">OS Format</label>
          <div class="px-3 py-2 bg-surface-alt border border-border rounded-lg text-sm text-muted">
            {{ selectedOs === 'ubuntu' || selectedOs === 'debian' ? 'Ubuntu/Debian: one IP per line (e.g. 10.0.0.5)' : 'CentOS: ip|netmask|gateway (e.g. 10.0.0.5|255.255.255.0|10.0.0.1)' }}
          </div>
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-sm font-medium text-fg-secondary mb-1">IP Lines</label>
        <textarea v-model="lines" rows="8" class="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" :placeholder="selectedOs === 'ubuntu' || selectedOs === 'debian' ? '10.0.0.5\n10.0.0.6' : '10.0.0.5|255.255.255.0|10.0.0.1'"></textarea>
      </div>

      <div class="flex justify-end mt-4">
        <button @click="handleConfigure" :disabled="loading || !selectedServerId" class="px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Configuring...' : 'Configure IPs' }}
        </button>
      </div>
    </div>
  </div>
</template>