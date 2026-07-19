<script setup>
import { ref, onMounted } from 'vue';
import { installProxyOnServers } from '../../api/proxies';
import { getMtaServers } from '../../api/mtaServers';

const loading = ref(false);
const servers = ref([]);
const selectedServerIds = ref([]);
const filterText = ref('');
const results = ref([]);

const form = ref({
  httpPort: 3128,
  socksPort: 1080,
  username: '',
  password: '',
});

const filteredServers = () => {
  if (!filterText.value) return servers.value;
  const q = filterText.value.toLowerCase();
  return servers.value.filter((s) => s.name.toLowerCase().includes(q) || (s.mainIp || '').toLowerCase().includes(q));
};

onMounted(async () => {
  try {
    const { data } = await getMtaServers({ limit: 1000 });
    servers.value = data.data || [];
  } catch (e) {
    console.error('Failed to load servers:', e);
  }
});

const toggleServer = (id) => {
  const idx = selectedServerIds.value.indexOf(id);
  if (idx >= 0) selectedServerIds.value.splice(idx, 1);
  else selectedServerIds.value.push(id);
};

const selectAll = () => { selectedServerIds.value = filteredServers().map((s) => s.id); };
const deselectAll = () => { selectedServerIds.value = []; };

const handleInstall = async () => {
  if (selectedServerIds.value.length === 0) return;
  loading.value = true;
  results.value = [];
  try {
    const { data } = await installProxyOnServers({
      serverIds: selectedServerIds.value,
      httpPort: form.value.httpPort,
      socksPort: form.value.socksPort,
      username: form.value.username || undefined,
      password: form.value.password || undefined,
    });
    results.value = data.results || [];
  } catch (e) {
    results.value = [{ server: 'Error', status: 'Failed', message: e.response?.data?.error || 'Installation failed.' }];
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Install Proxy on MTA Servers</h1>
      <router-link to="/proxies" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back to Proxies</router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Select MTA Servers</h3>
        <div class="flex items-center gap-2 mb-3">
          <input v-model="filterText" type="text" placeholder="Filter servers..." class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <button @click="selectAll" class="px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200">Select All</button>
          <button @click="deselectAll" class="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">Clear</button>
        </div>
        <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          <label v-for="s in filteredServers()" :key="s.id" class="flex items-center gap-3 px-3 py-2 border-b border-gray-50 hover:bg-gray-50 cursor-pointer text-sm">
            <input type="checkbox" :checked="selectedServerIds.includes(s.id)" @change="toggleServer(s.id)" class="rounded" />
            <span class="font-medium text-gray-800">{{ s.name }}</span>
            <span class="text-xs text-gray-400">{{ s.mainIp || '' }}</span>
          </label>
          <div v-if="filteredServers().length === 0" class="p-4 text-center text-gray-400 text-sm">No servers found.</div>
        </div>
        <p class="text-xs text-gray-500 mt-2">{{ selectedServerIds.length }} server(s) selected</p>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Proxy Settings</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">HTTP Port</label>
            <input v-model.number="form.httpPort" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">SOCKS Port</label>
            <input v-model.number="form.socksPort" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username (optional)</label>
            <input v-model="form.username" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password (optional)</label>
            <input v-model="form.password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <button @click="handleInstall" :disabled="loading || selectedServerIds.length === 0" class="w-full mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Installing...' : 'Install Squid Proxy' }}
        </button>
      </div>
    </div>

    <div v-if="results.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700">Installation Results</h3>
      </div>
      <table class="w-full text-sm">
        <thead class="border-b border-gray-200">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Server</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Message</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="(r, idx) in results" :key="idx" class="hover:bg-gray-50">
            <td class="px-4 py-2 font-medium text-gray-800">{{ r.server }}</td>
            <td class="px-4 py-2">
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', r.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">{{ r.status }}</span>
            </td>
            <td class="px-4 py-2 text-gray-600">{{ r.message }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
