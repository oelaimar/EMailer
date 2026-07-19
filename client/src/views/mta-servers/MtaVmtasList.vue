<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getMtaServers, bulkActionMtaServers } from '../../api/mtaServers';

const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);
const selectedServerId = ref(null);
const servers = ref([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Server Name' },
  { key: 'mainIp', label: 'IP' },
  { key: 'status', label: 'Status' },
  { key: 'sshStatus', label: 'SSH Status' },
  { key: 'installationStatus', label: 'Install Status' },
  { key: 'os', label: 'OS' },
];

onMounted(async () => {
  try {
    const { data } = await getMtaServers({ limit: 1000 });
    servers.value = data.data || [];
  } catch { servers.value = []; }
});

const fetchVmtas = () => {
  tableRef.value?.loadData();
};

const handleConfirm = async () => {
  loading.value = true;
  try { await confirmAction.value(); } catch (e) { console.error(e); }
  loading.value = false;
  confirmDialog.value = false;
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">VMTAs List</h1>
      <router-link to="/mta-servers" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">MTA Server</label>
          <select v-model="selectedServerId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option :value="null">All servers</option>
            <option v-for="s in servers" :key="s.id" :value="s.id">{{ s.name }} ({{ s.mainIp }})</option>
          </select>
        </div>
        <div>
          <button @click="fetchVmtas" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Load VMTAs
          </button>
        </div>
      </div>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => {
        const p = { ...params };
        if (selectedServerId) p.serverId = selectedServerId;
        const { data } = await getMtaServers(p);
        return data;
      }"
      :selectable="true"
      :group-actions="[
        { label: 'Activate', action: 'activate', class: 'bg-green-100 text-green-700 border-green-300' },
        { label: 'Inactivate', action: 'inactivate', class: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      ]"
      @group-action="async ({ action, ids }) => {
        confirmMessage = `${action} ${ids.length} server(s)?`;
        confirmAction = () => bulkActionMtaServers(action, ids).then(() => tableRef?.loadData());
        confirmDialog = true;
      }"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Activated' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600']">
          {{ value }}
        </span>
      </template>
      <template #cell-sshStatus="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Connected' ? 'bg-emerald-100 text-emerald-700' : value === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600']">
          {{ value }}
        </span>
      </template>
      <template #cell-installationStatus="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Installed' ? 'bg-emerald-100 text-emerald-700' : value === 'Installing' ? 'bg-yellow-100 text-yellow-700' : value === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600']">
          {{ value }}
        </span>
      </template>
    </DataTable>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
