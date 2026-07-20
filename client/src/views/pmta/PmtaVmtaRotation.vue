<script setup>
import { ref, onMounted } from 'vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getPmtaServerNames, createPmtaVmtaRotation, resetPmtaVmtas, getPmtaVmtas } from '../../api/pmta';
import { useToastStore } from '../../stores/toast';
import PageHeader from '../../components/common/PageHeader.vue';
const toastStore = useToastStore();

const loading = ref(false);
const creating = ref(false);
const error = ref('');
const success = ref('');
const servers = ref([]);
const existingVmtas = ref([]);
const selectedServers = ref([]);
const encryption = ref('none');
const smtpsText = ref('');
const showResetConfirm = ref(false);
const filterText = ref('');

const filteredServers = () => {
  if (!filterText.value) return servers.value;
  const q = filterText.value.toLowerCase();
  return servers.value.filter((s) => s.name.toLowerCase().includes(q) || (s.mainIp || '').toLowerCase().includes(q));
};

onMounted(async () => {
  try {
    const [serversRes, vmtasRes] = await Promise.all([
      getPmtaServerNames(),
      getPmtaVmtas({ vmtaType: 'smtp' }),
    ]);
    servers.value = serversRes.data || [];
    existingVmtas.value = vmtasRes.data || [];
  } catch (e) {
    toastStore.showToast('Failed to load data', 'error');
  }
});

const toggleServer = (name) => {
  const idx = selectedServers.value.indexOf(name);
  if (idx >= 0) selectedServers.value.splice(idx, 1);
  else selectedServers.value.push(name);
};

const selectAll = () => { selectedServers.value = filteredServers().map((s) => s.name); };
const deselectAll = () => { selectedServers.value = []; };

const handleCreate = async () => {
  if (selectedServers.value.length === 0) { error.value = 'Select at least one server.'; return; }
  if (!smtpsText.value.trim()) { error.value = 'Enter SMTP entries.'; return; }

  creating.value = true;
  error.value = '';
  success.value = '';
  try {
    const { data } = await createPmtaVmtaRotation({
      serverNames: selectedServers.value,
      encryption: encryption.value,
      smtps: smtpsText.value,
    });
    success.value = data.message || 'Rotation created.';
    const { data: refreshed } = await getPmtaVmtas({ vmtaType: 'smtp' });
    existingVmtas.value = refreshed || [];
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to create rotation.';
  } finally {
    creating.value = false;
  }
};

const handleReset = async () => {
  if (selectedServers.value.length === 0) { error.value = 'Select servers to reset.'; return; }
  creating.value = true;
  error.value = '';
  success.value = '';
  try {
    const { data } = await resetPmtaVmtas({ serverNames: selectedServers.value });
    success.value = data.message || 'Reset completed.';
    const { data: refreshed } = await getPmtaVmtas({ vmtaType: 'smtp' });
    existingVmtas.value = refreshed || [];
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to reset.';
  } finally {
    creating.value = false;
    showResetConfirm.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="SMTP VMTA Rotation" />
      <router-link to="/pmta/vmtas" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">Back to VMTAs</router-link>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
    <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="lg:col-span-2 bg-surface rounded-xl border border-border p-6">
        <h3 class="text-sm font-semibold text-fg-secondary mb-3">Select PMTA Servers</h3>
        <div class="flex items-center gap-2 mb-3">
          <input v-model="filterText" type="text" placeholder="Filter servers..." class="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <button @click="selectAll" class="px-3 py-2 bg-primary-light text-primary text-sm rounded-lg hover:bg-blue-200">Select All</button>
          <button @click="deselectAll" class="px-3 py-2 bg-surface-alt text-fg-secondary text-sm rounded-lg hover:bg-border">Clear</button>
        </div>
        <div class="max-h-64 overflow-y-auto border border-border rounded-lg">
          <label v-for="s in filteredServers()" :key="s.id" class="flex items-center gap-3 px-3 py-2 border-b border-border-light hover:bg-surface-alt cursor-pointer text-sm">
            <input type="checkbox" :checked="selectedServers.includes(s.name)" @change="toggleServer(s.name)" class="rounded" />
            <span class="font-medium text-fg">{{ s.name }}</span>
            <span class="text-xs text-muted">{{ s.mainIp || '' }}</span>
          </label>
          <div v-if="filteredServers().length === 0" class="p-4 text-center text-muted text-sm">No servers found.</div>
        </div>
        <p class="text-xs text-muted mt-2">{{ selectedServers.length }} server(s) selected</p>
      </div>

      <div class="bg-surface rounded-xl border border-border p-6">
        <h3 class="text-sm font-semibold text-fg-secondary mb-3">Settings</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-fg-secondary mb-1">Encryption</label>
          <select v-model="encryption" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="none">None</option>
            <option value="ssl">SSL</option>
            <option value="tls">TLS</option>
          </select>
        </div>

        <h3 class="text-sm font-semibold text-fg-secondary mb-2">SMTP Entries</h3>
        <p class="text-xs text-muted mb-2">Format: host port username password (one per line)</p>
        <textarea v-model="smtpsText" rows="10" class="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="mail1.example.com 587 user1 pass1&#10;mail2.example.com 587 user2 pass2"></textarea>
        <p class="text-xs text-muted mt-1">{{ smtpsText.split('\n').filter(l => l.trim()).length }} entries</p>

        <div class="flex gap-2 mt-4">
          <button @click="handleCreate" :disabled="creating || selectedServers.length === 0" class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ creating ? 'Creating...' : 'Create Rotation' }}
          </button>
          <button @click="showResetConfirm = true" :disabled="creating || selectedServers.length === 0" class="px-4 py-2 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 text-sm font-medium rounded-lg transition-colors">
            Reset
          </button>
        </div>
      </div>
    </div>

    <div v-if="existingVmtas.length" class="bg-surface rounded-xl border border-border overflow-hidden">
      <div class="px-4 py-3 bg-surface-alt border-b border-border">
        <h3 class="text-sm font-semibold text-fg-secondary">Existing SMTP VMTAs ({{ existingVmtas.length }})</h3>
      </div>
      <table class="w-full text-sm">
        <thead class="border-b border-border">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-muted">Server</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-muted">Type</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-muted">Encryption</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-muted">SMTPs</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-muted">Created</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="v in existingVmtas" :key="v.id" class="hover:bg-surface-alt">
            <td class="px-4 py-2 font-medium text-fg">{{ v.serverName }}</td>
            <td class="px-4 py-2 text-muted">{{ v.vmtaType }}</td>
            <td class="px-4 py-2 text-muted">{{ v.configData?.encryption || 'none' }}</td>
            <td class="px-4 py-2 text-muted">{{ v.configData?.smtps?.length || 0 }}</td>
            <td class="px-4 py-2 text-muted text-xs">{{ new Date(v.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmDialog
      :show="showResetConfirm"
      title="Reset SMTP VMTAs"
      :message="`Delete all SMTP VMTA configs for ${selectedServers.length} selected server(s)?`"
      confirm-text="Reset"
      @confirm="handleReset"
      @cancel="showResetConfirm = false"
    />
  </div>
</template>