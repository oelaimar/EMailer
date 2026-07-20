<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { getMtaServers, getMtaServerInfo, bulkInstallMta, getBulkInstallLogs } from '../../api/mtaServers';
import PageHeader from '../../components/common/PageHeader.vue';

const loading = ref(false);
const error = ref('');
const servers = ref([]);
const selectedIds = ref([]);
const step = ref(1);
const serverInfos = ref({});
const installRunning = ref(false);
const logs = ref('');
let pollInterval = null;

const config = ref({
  installServices: true,
  updatePort: false,
  updatePassword: false,
  installFirewall: false,
  updateIps: true,
  activateDkim: true,
  activateDmarc: true,
  keepOldSubs: true,
  installTracking: true,
  useSslCerts: false,
  useBrands: true,
  installPmta: true,
  pmtaVersion: 'pmta45',
});

const perServerMapping = ref({});

onMounted(async () => {
  try {
    const { data } = await getMtaServers({ limit: 1000, status: 'Activated' });
    servers.value = data.data || [];
  } catch { servers.value = []; }
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id);
  if (idx === -1) selectedIds.value.push(id);
  else selectedIds.value.splice(idx, 1);
};

const selectAll = () => {
  selectedIds.value = servers.value.map(s => s.id);
};

const clearSelection = () => {
  selectedIds.value = [];
};

const loadSelectedServers = async () => {
  if (selectedIds.value.length === 0) return;
  loading.value = true;
  error.value = '';
  try {
    for (const id of selectedIds.value) {
      const { data } = await getMtaServerInfo(id);
      serverInfos.value[id] = data.server;
      const domains = data.domains || [];
      const ips = data.ipsV4 || [];
      perServerMapping.value[id] = domains.slice(0, 5).map((d, i) => ({
        domainId: d.name,
        ipsV4: ips.length ? [ips[i % ips.length]] : [],
        ipsV6: [],
      }));
    }
    step.value = 2;
  } catch (e) {
    error.value = 'Failed to load some server info.';
  } finally {
    loading.value = false;
  }
};

const addMappingRow = (serverId) => {
  perServerMapping.value[serverId].push({ domainId: '', ipsV4: [], ipsV6: [] });
};

const removeMappingRow = (serverId, i) => {
  perServerMapping.value[serverId].splice(i, 1);
};

const startBulkInstall = async () => {
  step.value = 3;
  installRunning.value = true;
  logs.value = 'Starting bulk installation...\n';

  const jobs = selectedIds.value.map(id => ({
    serverId: id,
    mapping: perServerMapping.value[id] || [],
  }));

  try {
    bulkInstallMta({ ids: selectedIds.value, ...config.value, jobs });
    pollInterval = setInterval(async () => {
      try {
        const { data } = await getBulkInstallLogs(selectedIds.value);
        const serverLogs = (data.servers || []).map(s => `[${s.name}] ${s.installationStatus}`).join('\n');
        logs.value = serverLogs || 'Waiting for installation to begin...';
      } catch { /* ignore */ }
    }, 3000);
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to start bulk installation.';
    installRunning.value = false;
    if (pollInterval) clearInterval(pollInterval);
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="Bulk Install MTA Servers" />
      <router-link to="/mta-servers" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

    <div class="flex items-center gap-4 mb-6">
      <div v-for="s in 3" :key="s" class="flex items-center gap-2">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', step >= s ? 'bg-primary text-white' : 'bg-surface-alt text-muted']">{{ s }}</div>
        <span :class="['text-sm font-medium', step >= s ? 'text-blue-600' : 'text-muted']">{{ s === 1 ? 'Select Servers' : s === 2 ? 'Per-Server Mapping' : 'Installation' }}</span>
        <div v-if="s < 3" class="w-12 h-px bg-border"></div>
      </div>
    </div>

    <div v-if="step === 1" class="bg-surface rounded-xl border border-border p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Select Servers ({{ selectedIds.length }} selected)</h2>
        <div class="flex gap-2">
          <button @click="selectAll" class="px-3 py-1 bg-primary-light text-primary text-xs font-medium rounded-lg hover:bg-blue-200">Select All</button>
          <button @click="clearSelection" class="px-3 py-1 bg-surface-alt text-fg-secondary text-xs font-medium rounded-lg hover:bg-border">Clear</button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <label v-for="s in servers" :key="s.id" :class="['flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors', selectedIds.includes(s.id) ? 'border-blue-500 bg-blue-50' : 'border-border hover:bg-surface-alt']">
          <input type="checkbox" :checked="selectedIds.includes(s.id)" @change="toggleSelect(s.id)" class="rounded" />
          <div class="text-sm">
            <div class="font-medium">{{ s.name }}</div>
            <div class="text-muted">{{ s.mainIp }} — {{ s.os }}</div>
          </div>
        </label>
      </div>
      <div class="flex justify-end mt-6">
        <button @click="loadSelectedServers" :disabled="selectedIds.length === 0 || loading" class="px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Loading...' : 'Next →' }}
        </button>
      </div>
    </div>

    <div v-if="step === 2" class="space-y-6">
      <div class="bg-surface rounded-xl border border-border p-6">
        <h2 class="text-lg font-semibold mb-4">Configuration</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.installServices" class="rounded" /> Install Services</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.installFirewall" class="rounded" /> Firewall</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.updateIps" class="rounded" /> Update IPs</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.activateDkim" class="rounded" /> DKIM</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.activateDmarc" class="rounded" /> DMARC</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.installTracking" class="rounded" /> Tracking</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.useBrands" class="rounded" /> Brands</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="config.installPmta" class="rounded" /> PowerMTA</label>
        </div>
      </div>

      <div v-for="sid in selectedIds" :key="sid" class="bg-surface rounded-xl border border-border p-6">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold">{{ serverInfos[sid]?.name }} ({{ serverInfos[sid]?.mainIp }})</h3>
          <button @click="addMappingRow(sid)" class="px-2 py-1 bg-primary-light text-primary text-xs rounded-lg hover:bg-blue-200">+ Add Mapping</button>
        </div>
        <div class="space-y-2">
          <div v-for="(m, i) in perServerMapping[sid]" :key="i" class="flex items-center gap-2 text-xs">
            <input v-model="m.domainId" placeholder="domain.com" class="flex-1 px-2 py-1 border border-border rounded" />
            <input v-model="m.ipsV4" placeholder="IPs comma separated" class="w-48 px-2 py-1 border border-border rounded" @input="m.ipsV4 = $event.target.value.split(',')" />
            <button @click="removeMappingRow(sid, i)" class="text-red-500 hover:text-red-700">✕</button>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button @click="step = 1" class="px-4 py-2 bg-surface-alt text-fg-secondary text-sm font-medium rounded-lg hover:bg-border">← Back</button>
        <button @click="startBulkInstall" :disabled="loading" class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium rounded-lg transition-colors">
          Start Bulk Installation
        </button>
      </div>
    </div>

    <div v-if="step === 3" class="bg-surface rounded-xl border border-border p-6">
      <h2 class="text-lg font-semibold mb-4">Bulk Installation Progress</h2>
      <pre class="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono h-96 overflow-y-auto whitespace-pre-wrap">{{ logs }}</pre>
      <div class="flex justify-end mt-4">
        <button @click="step = 2; installRunning = false" :disabled="installRunning" class="px-4 py-2 bg-surface-alt text-fg-secondary text-sm font-medium rounded-lg hover:bg-border disabled:opacity-50">← Back to Config</button>
      </div>
    </div>
  </div>
</template>