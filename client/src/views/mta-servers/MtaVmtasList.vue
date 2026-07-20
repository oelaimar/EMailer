<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import PageHeader from '../../components/common/PageHeader.vue';
import StatusBadge from '../../components/common/StatusBadge.vue';
import { getMtaServers, bulkActionMtaServers } from '../../api/mtaServers';
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();

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
  try { await confirmAction.value(); } catch (e) { toastStore.showToast('Action failed', 'error'); }
  loading.value = false;
  confirmDialog.value = false;
};
</script>

<template>
  <div>
    <PageHeader title="VMTAs List" action-label="Back to List" action-to="/mta-servers" />

    <div class="bg-surface rounded-xl border border-border p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-fg-secondary mb-1">MTA Server</label>
          <select v-model="selectedServerId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option :value="null">All servers</option>
            <option v-for="s in servers" :key="s.id" :value="s.id">{{ s.name }} ({{ s.mainIp }})</option>
          </select>
        </div>
        <div>
          <button @click="fetchVmtas" class="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors">
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
        { label: 'Activate', action: 'activate', class: 'bg-success-light text-success border-green-300' },
        { label: 'Inactivate', action: 'inactivate', class: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      ]"
      @group-action="async ({ action, ids }) => {
        confirmMessage = `${action} ${ids.length} server(s)?`;
        confirmAction = () => bulkActionMtaServers(action, ids).then(() => tableRef?.loadData());
        confirmDialog = true;
      }"
    >
      <template #cell-status="{ value }">
        <StatusBadge :value="value" />
      </template>
      <template #cell-sshStatus="{ value }">
        <StatusBadge :value="value" />
      </template>
      <template #cell-installationStatus="{ value }">
        <StatusBadge :value="value" />
      </template>
    </DataTable>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
