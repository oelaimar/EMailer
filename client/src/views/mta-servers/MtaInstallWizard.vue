<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { getMtaServers, getMtaServerInfo, installMtaServer, getInstallLogs } from '../../api/mtaServers';

const route = useRoute();
const step = ref(1);
const loading = ref(false);
const error = ref('');
const servers = ref([]);
const selectedServerId = ref(route.params.id ? parseInt(route.params.id, 10) : null);
const serverInfo = ref(null);
const domains = ref([]);
const ipsV4 = ref([]);
const ipsV6 = ref([]);

const config = ref({
  installServices: true,
  updatePort: false,
  updatePassword: false,
  installFirewall: false,
  updateIps: true,
  activateDkim: true,
  activateDmarc: true,
  keepOldSubs: true,
  usePredefinedSubs: false,
  installTracking: true,
  useSslCerts: false,
  useBrands: true,
  installPmta: true,
  pmtaVersion: 'pmta45',
});

const mapping = ref([]);
const logs = ref('');
const installRunning = ref(false);
let pollInterval = null;

onMounted(async () => {
  try {
    const { data } = await getMtaServers({ limit: 1000, status: 'Activated' });
    servers.value = data.data || [];
  } catch { servers.value = []; }
  if (selectedServerId.value) loadServerInfo();
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});

const loadServerInfo = async () => {
  if (!selectedServerId.value) return;
  loading.value = true;
  error.value = '';
  try {
    const { data } = await getMtaServerInfo(selectedServerId.value);
    serverInfo.value = data.server;
    domains.value = data.domains || [];
    ipsV4.value = data.ipsV4 || [];
    ipsV6.value = data.ipsV6 || [];
    mapping.value = [{ domainId: '', ipsV4: [], ipsV6: [] }];
    step.value = 2;
  } catch (e) {
    error.value = 'Failed to load server info. Is the server reachable?';
  } finally {
    loading.value = false;
  }
};

const addMapping = () => {
  mapping.value.push({ domainId: '', ipsV4: [], ipsV6: [] });
};

const removeMapping = (i) => {
  mapping.value.splice(i, 1);
};

const generateRandomMapping = async () => {
  const availableDomains = domains.value.map(d => d.name);
  const shuffled = availableDomains.sort(() => Math.random() - 0.5);
  const count = Math.min(60, shuffled.length);
  mapping.value = [];
  for (let i = 0; i < count; i++) {
    mapping.value.push({
      domainId: shuffled[i],
      ipsV4: ipsV4.value.length ? [ipsV4.value[i % ipsV4.value.length]] : [],
      ipsV6: ipsV6.value.length ? [ipsV6.value[i % ipsV6.value.length]] : [],
    });
  }
};

const startInstallation = async () => {
  step.value = 3;
  installRunning.value = true;
  logs.value = 'Starting installation...\n';

  try {
    installMtaServer(selectedServerId.value, { ...config.value, mapping: mapping.value });
    pollInterval = setInterval(async () => {
      try {
        const { data } = await getInstallLogs(selectedServerId.value);
        logs.value = data.logs || 'No logs yet...';
        const el = document.getElementById('install-log');
        if (el) el.scrollTop = el.scrollHeight;
      } catch { /* ignore */ }
    }, 3000);
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to start installation.';
    installRunning.value = false;
    if (pollInterval) clearInterval(pollInterval);
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">MTA Install Wizard</h1>
      <router-link to="/mta-servers" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

    <div class="flex items-center gap-4 mb-6">
      <div v-for="s in 3" :key="s" class="flex items-center gap-2">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600']">{{ s }}</div>
        <span :class="['text-sm font-medium', step >= s ? 'text-blue-600' : 'text-gray-500']">{{ s === 1 ? 'Select Server' : s === 2 ? 'Configuration' : 'Installation' }}</span>
        <div v-if="s < 3" class="w-12 h-px bg-gray-300"></div>
      </div>
    </div>

    <div v-if="step === 1" class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-semibold mb-4">Select Server</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">MTA Server</label>
          <select v-model="selectedServerId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option :value="null">Select a server...</option>
            <option v-for="s in servers" :key="s.id" :value="s.id">{{ s.name }} ({{ s.mainIp }}) — {{ s.os }}</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end mt-6">
        <button @click="loadServerInfo" :disabled="!selectedServerId || loading" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Loading...' : 'Next →' }}
        </button>
      </div>
    </div>

    <div v-if="step === 2" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold mb-4">Server Info</h2>
        <table v-if="serverInfo" class="w-full text-sm">
          <tr><td class="py-1 text-gray-500">ID</td><td class="py-1 font-medium">{{ serverInfo.id }}</td></tr>
          <tr><td class="py-1 text-gray-500">Name</td><td class="py-1 font-medium">{{ serverInfo.name }}</td></tr>
          <tr><td class="py-1 text-gray-500">Main IP</td><td class="py-1 font-medium">{{ serverInfo.mainIp }}</td></tr>
          <tr><td class="py-1 text-gray-500">OS</td><td class="py-1 font-medium">{{ serverInfo.os }}</td></tr>
          <tr><td class="py-1 text-gray-500">RAM</td><td class="py-1 font-medium">{{ serverInfo.ram }}</td></tr>
          <tr><td class="py-1 text-gray-500">Storage</td><td class="py-1 font-medium">{{ serverInfo.storage }}</td></tr>
          <tr><td class="py-1 text-gray-500">IPv4 Count</td><td class="py-1 font-medium">{{ serverInfo.ipv4Count }}</td></tr>
          <tr><td class="py-1 text-gray-500">IPv6 Count</td><td class="py-1 font-medium">{{ serverInfo.ipv6Count }}</td></tr>
        </table>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold mb-4">Configuration</h2>
        <div class="space-y-2 text-sm">
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.installServices" class="rounded" /> Install Services</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.updatePort" class="rounded" /> Update SSH Port</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.updatePassword" class="rounded" /> Update Password</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.installFirewall" class="rounded" /> Install Firewall</label>
          <hr class="my-2" />
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.updateIps" class="rounded" /> Update IPs</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.activateDkim" class="rounded" :disabled="!config.updateIps" /> Activate DKIM</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.activateDmarc" class="rounded" :disabled="!config.updateIps" /> Activate DMARC</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.keepOldSubs" class="rounded" :disabled="!config.updateIps" /> Keep Old Subs</label>
          <hr class="my-2" />
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.installTracking" class="rounded" /> Install Tracking</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.useSslCerts" class="rounded" :disabled="!config.installTracking" /> Use SSL Certs</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.useBrands" class="rounded" :disabled="!config.installTracking" /> Use Brands</label>
          <hr class="my-2" />
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.installPmta" class="rounded" /> Install PowerMTA</label>
          <div v-if="config.installPmta" class="ml-6">
            <select v-model="config.pmtaVersion" class="px-2 py-1 border border-gray-300 rounded text-xs">
              <option value="pmta40">PMTA 4.0</option>
              <option value="pmta45">PMTA 4.5</option>
              <option value="pmta50">PMTA 5.0</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Domain/IP Mapping</h2>
          <div class="flex gap-2">
            <button @click="generateRandomMapping" class="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-200">Random Mapping</button>
            <button @click="addMapping" class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200">+ Add</button>
          </div>
        </div>
        <div class="max-h-96 overflow-y-auto space-y-2">
          <div v-for="(m, i) in mapping" :key="i" class="flex items-center gap-2 text-sm">
            <select v-model="m.domainId" class="flex-1 px-2 py-1 border border-gray-300 rounded text-xs">
              <option value="">Select domain...</option>
              <option v-for="d in domains" :key="d.id" :value="d.name">{{ d.name }}</option>
            </select>
            <select v-model="m.ipsV4" multiple class="w-24 px-2 py-1 border border-gray-300 rounded text-xs" size="2">
              <option v-for="ip in ipsV4" :key="ip" :value="ip">{{ ip }}</option>
            </select>
            <button @click="removeMapping(i)" class="text-red-500 hover:text-red-700 text-xs">✕</button>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">{{ mapping.length }} mapping(s) configured</p>
      </div>
    </div>

    <div v-if="step === 3" class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Installation Log</h2>
        <button @click="step = 2" :disabled="installRunning" class="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50">← Back</button>
      </div>
      <pre id="install-log" class="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono h-96 overflow-y-auto whitespace-pre-wrap">{{ logs }}</pre>
    </div>

    <div v-if="step === 2" class="flex justify-end mt-6">
      <button @click="startInstallation" :disabled="loading || mapping.length === 0" class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium rounded-lg transition-colors">
        Start Installation
      </button>
    </div>
  </div>
</template>
