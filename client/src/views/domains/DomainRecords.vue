<script setup>
import { ref, onMounted, watch } from 'vue';
import { getDomains, getDomainRecords, setDomainRecords } from '../../api/domains';
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const domains = ref([]);
const domainGroups = ref({});
const selectedAccountId = ref('');
const selectedDomainId = ref('');
const records = ref([]);

const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'PTR', 'CAA'];
const TTL_OPTIONS = [60, 300, 1200, 3600, 7200, 86400];

const newRecord = () => ({ type: 'A', name: '@', value: '', ttl: 3600, priority: null, proxied: false });

onMounted(async () => {
  try {
    const { data } = await getDomains({ limit: 10000 });
    domains.value = data.data || [];
    const grouped = {};
    for (const d of domains.value) {
      const key = d.accountName || 'Unassigned';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(d);
    }
    domainGroups.value = grouped;
  } catch (e) {
    toastStore.showToast('Failed to load data', 'error');
  }
});

watch(selectedDomainId, async (val) => {
  if (!val) { records.value = []; return; }
  loading.value = true;
  error.value = '';
  try {
    const { data } = await getDomainRecords(val);
    records.value = data.map((r) => ({ ...r, proxied: !!r.proxied }));
  } catch (e) {
    error.value = 'Failed to load records.';
  } finally {
    loading.value = false;
  }
});

const addRecord = () => { records.value.push(newRecord()); };
const removeRecord = (idx) => { records.value.splice(idx, 1); };
const removeAllRecords = () => { records.value = []; };

const saveRecords = async () => {
  if (!selectedDomainId.value) return;
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    await setDomainRecords(selectedDomainId.value, records.value);
    success.value = `${records.value.length} records saved successfully.`;
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save records.';
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Manage Domain Records</h1>
      <router-link to="/domains" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back to Domains</router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Account</label>
          <select v-model="selectedAccountId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All accounts</option>
            <option v-for="(_, name) in domainGroups" :key="name" :value="name">{{ name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Domain *</label>
          <select v-model="selectedDomainId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Select domain...</option>
            <template v-if="selectedAccountId && domainGroups[selectedAccountId]">
              <option v-for="d in domainGroups[selectedAccountId]" :key="d.id" :value="d.id">{{ d.name }}</option>
            </template>
            <template v-else>
              <option v-for="d in domains" :key="d.id" :value="d.id">{{ d.name }} ({{ d.accountName || 'No account' }})</option>
            </template>
          </select>
        </div>
      </div>
    </div>

    <div v-if="selectedDomainId" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-700">DNS Records ({{ records.length }})</h3>
        <div class="flex gap-2">
          <button @click="addRecord" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg">+ Add Record</button>
          <button @click="removeAllRecords" class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg">Clear All</button>
        </div>
      </div>

      <div v-if="error" class="mx-4 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div v-if="success" class="mx-4 mt-3 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

      <div v-if="loading" class="p-8 text-center text-gray-400 text-sm">Loading records...</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 w-28">Type</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Host</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Value</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 w-24">TTL</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 w-20">Priority</th>
              <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 w-20">Proxy</th>
              <th class="px-3 py-2 w-12"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(r, idx) in records" :key="idx" class="hover:bg-gray-50">
              <td class="px-3 py-2">
                <select v-model="r.type" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                  <option v-for="t in RECORD_TYPES" :key="t" :value="t">{{ t }}</option>
                </select>
              </td>
              <td class="px-3 py-2">
                <input v-model="r.name" type="text" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="@ or subdomain" />
              </td>
              <td class="px-3 py-2">
                <input v-model="r.value" type="text" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="IP or target" />
              </td>
              <td class="px-3 py-2">
                <select v-model.number="r.ttl" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                  <option v-for="t in TTL_OPTIONS" :key="t" :value="t">{{ t }}</option>
                </select>
              </td>
              <td class="px-3 py-2">
                <input v-model.number="r.priority" type="number" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="-" />
              </td>
              <td class="px-3 py-2 text-center">
                <input type="checkbox" v-model="r.proxied" class="rounded" />
              </td>
              <td class="px-3 py-2">
                <button @click="removeRecord(idx)" class="text-red-400 hover:text-red-600 text-lg">&times;</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="records.length === 0" class="p-8 text-center text-gray-400 text-sm">No records. Click "Add Record" to start.</div>
      </div>

      <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
        <button @click="saveRecords" :disabled="saving" class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ saving ? 'Saving...' : 'Save Records' }}
        </button>
      </div>
    </div>
  </div>
</template>
