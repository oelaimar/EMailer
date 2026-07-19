<script setup>
import { ref, onMounted } from 'vue';
import { getDomains, setMultiDomainsRecords } from '../../api/domains';

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const domains = ref([]);
const domainGroups = ref({});
const selectedAccountId = ref('');
const selectedDomainIds = ref([]);
const operation = ref('add');

const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'PTR', 'CAA'];
const TTL_OPTIONS = [60, 300, 1200, 3600, 7200, 86400];

const records = ref([{ type: 'A', name: '@', value: '', ttl: 3600, priority: null, proxied: false }]);

const filteredDomains = () => {
  if (selectedAccountId.value && domainGroups.value[selectedAccountId.value]) {
    return domainGroups.value[selectedAccountId.value];
  }
  return domains.value;
};

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
    console.error('Failed to load domains:', e);
  }
});

const toggleDomain = (id) => {
  const idx = selectedDomainIds.value.indexOf(id);
  if (idx >= 0) selectedDomainIds.value.splice(idx, 1);
  else selectedDomainIds.value.push(id);
};

const selectAllDomains = () => {
  selectedDomainIds.value = filteredDomains().map((d) => d.id);
};

const deselectAllDomains = () => { selectedDomainIds.value = []; };

const addRecord = () => { records.value.push({ type: 'A', name: '@', value: '', ttl: 3600, priority: null, proxied: false }); };
const removeRecord = (idx) => { records.value.splice(idx, 1); };

const operationLabel = () => {
  if (operation.value === 'add') return 'Apply Bulk Add';
  if (operation.value === 'edit') return 'Apply Bulk Edit';
  return 'Delete Matching Records';
};

const operationClass = () => {
  if (operation.value === 'delete') return 'bg-red-600 hover:bg-red-700';
  return 'bg-emerald-600 hover:bg-emerald-700';
};

const handleApply = async () => {
  if (selectedDomainIds.value.length === 0) { error.value = 'Select at least one domain.'; return; }
  if (records.value.length === 0) { error.value = 'Add at least one record.'; return; }

  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    const { data } = await setMultiDomainsRecords({
      domainIds: selectedDomainIds.value,
      operation: operation.value,
      records: records.value,
    });
    success.value = data.message || 'Operation completed.';
  } catch (e) {
    error.value = e.response?.data?.error || 'Operation failed.';
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Manage Multi Records</h1>
      <router-link to="/domains" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back to Domains</router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Operation *</label>
          <select v-model="operation" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="add">Add Records</option>
            <option value="edit">Edit (Update Matching)</option>
            <option value="delete">Delete (Remove Matching)</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">
            {{ operation === 'add' ? 'Append new records to selected domains' : operation === 'edit' ? 'Update records matching type+host' : 'Delete records matching type+host' }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Account Filter</label>
          <select v-model="selectedAccountId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All accounts</option>
            <option v-for="(_, name) in domainGroups" :key="name" :value="name">{{ name }}</option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <button @click="selectAllDomains" class="px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200">Select All</button>
          <button @click="deselectAllDomains" class="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">Deselect All</button>
          <span class="text-sm text-gray-500 pb-2">{{ selectedDomainIds.length }} selected</span>
        </div>
      </div>

      <div class="mb-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
        <label v-for="d in filteredDomains()" :key="d.id" class="flex items-center gap-2 text-sm cursor-pointer py-0.5">
          <input type="checkbox" :checked="selectedDomainIds.includes(d.id)" @change="toggleDomain(d.id)" class="rounded" />
          <span>{{ d.name }}</span>
          <span class="text-xs text-gray-400">{{ d.accountName || '' }}</span>
        </label>
        <div v-if="filteredDomains().length === 0" class="text-sm text-gray-400 py-2">No domains found.</div>
      </div>

      <h3 class="text-sm font-semibold text-gray-700 mb-2">
        {{ operation === 'add' ? 'Records to Add' : operation === 'edit' ? 'Match & Update' : 'Records to Delete' }}
      </h3>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 w-28">Type</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">{{ operation === 'delete' ? 'Match Host' : 'Host' }}</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">{{ operation === 'edit' ? 'New Value' : operation === 'delete' ? 'Match Value (optional)' : 'Value' }}</th>
              <th v-if="operation !== 'delete'" class="px-3 py-2 text-left text-xs font-medium text-gray-500 w-24">TTL</th>
              <th v-if="operation !== 'delete'" class="px-3 py-2 text-center text-xs font-medium text-gray-500 w-20">Proxy</th>
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
              <td v-if="operation !== 'delete'" class="px-3 py-2">
                <select v-model.number="r.ttl" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                  <option v-for="t in TTL_OPTIONS" :key="t" :value="t">{{ t }}</option>
                </select>
              </td>
              <td v-if="operation !== 'delete'" class="px-3 py-2 text-center">
                <input type="checkbox" v-model="r.proxied" class="rounded" />
              </td>
              <td class="px-3 py-2">
                <button @click="removeRecord(idx)" class="text-red-400 hover:text-red-600 text-lg">&times;</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-between items-center">
        <button @click="addRecord" class="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200">+ Add Row</button>
        <button @click="handleApply" :disabled="saving || selectedDomainIds.length === 0" :class="['px-6 py-2 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50', operationClass()]">
          {{ saving ? 'Applying...' : operationLabel() }}
        </button>
      </div>
    </div>
  </div>
</template>
