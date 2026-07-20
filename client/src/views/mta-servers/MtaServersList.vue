<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import StatusBadge from '../../components/common/StatusBadge.vue';
import { getMtaServers, deleteMtaServer, bulkActionMtaServers, checkMtaServer } from '../../api/mtaServers';
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();

const router = useRouter();
const tableRef = ref(null);
const selected = ref([]);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'mainIp', label: 'Main IP' },
  { key: 'status', label: 'Status' },
  { key: 'sshStatus', label: 'SSH Status' },
  { key: 'os', label: 'OS' },
  { key: 'hostname', label: 'Hostname' },
  { key: 'country', label: 'Country' },
  { key: 'installationStatus', label: 'Install Status' },
];

const actions = [
  { label: 'Edit', class: 'bg-primary-light text-primary hover:bg-blue-200', handler: (row) => router.push(`/mta-servers/${row.id}/edit`) },
  { label: 'Install', class: 'bg-green-100 text-green-700 hover:bg-green-200', handler: (row) => router.push(`/mta-servers/install/${row.id}`) },
  { label: 'Check', class: 'bg-purple-100 text-purple-700 hover:bg-purple-200', handler: async (row) => {
    try { await checkMtaServer(row.id); tableRef.value?.loadData(); } catch (e) { toastStore.showToast('Action failed', 'error'); }
  }},
  { label: 'Delete', class: 'bg-danger-light text-danger hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete MTA server "${row.name}"?`;
    confirmAction.value = () => deleteMtaServer(row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const groupActions = [
  { label: 'Activate', action: 'activate', class: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
  { label: 'Inactivate', action: 'inactivate', class: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
  { label: 'Delete', action: 'delete', class: 'bg-danger-light text-danger border-red-300 hover:bg-red-200' },
];

const handleGroupAction = async ({ action, ids }) => {
  confirmMessage.value = `${action} ${ids.length} server(s)?`;
  confirmAction.value = () => bulkActionMtaServers(action, ids).then(() => tableRef.value?.loadData());
  confirmDialog.value = true;
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
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-fg">MTA Servers</h1>
      <div class="flex items-center gap-2">
        <router-link to="/mta-servers/multi-add" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
          Multi-Add
        </router-link>
        <router-link to="/mta-servers/install" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
          Install
        </router-link>
        <router-link to="/mta-servers/actions" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors">
          Actions
        </router-link>
        <router-link to="/mta-servers/vmtas" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          VMTAs
        </router-link>
        <router-link to="/mta-servers/add" class="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors">
          + Add New Server
        </router-link>
      </div>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getMtaServers(params)).data"
      :selectable="true"
      :actions="actions"
      :group-actions="groupActions"
      @group-action="handleGroupAction"
    >
      <template #cell-status="{ value }">
        <StatusBadge :value="value" />
      </template>
      <template #cell-sshStatus="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full', value === 'Connected' ? 'bg-success-light text-success' : value === 'Failed' ? 'bg-danger-light text-danger' : 'bg-surface-alt text-muted']">
          {{ value }}
        </span>
      </template>
    </DataTable>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
