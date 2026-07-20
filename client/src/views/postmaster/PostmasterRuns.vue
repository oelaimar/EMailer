<script setup>
import { ref, onMounted } from 'vue';
import { getPostmasterRuns, getPostmasterRunLogs } from '../../api/postmaster';
import { useToastStore } from '../../stores/toast';
import PageHeader from '../../components/common/PageHeader.vue';
const toastStore = useToastStore();

const runs = ref([]);
const loading = ref(true);

const showLogModal = ref(false);
const logContent = ref(null);
const logLoading = ref(false);

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString();
};

const loadRuns = async () => {
  loading.value = true;
  try {
    const { data } = await getPostmasterRuns();
    runs.value = data.data || [];
  } catch (e) {
    toastStore.showToast('Failed to load data', 'error');
  } finally {
    loading.value = false;
  }
};

const viewLog = async (run) => {
  logLoading.value = true;
  showLogModal.value = true;
  logContent.value = null;
  try {
    const { data } = await getPostmasterRunLogs(run.id);
    logContent.value = data.data;
  } catch (e) {
    toastStore.showToast('Failed to load data', 'error');
  } finally {
    logLoading.value = false;
  }
};

const statusBadge = (status) => {
  const map = {
    running: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-surface-alt text-muted';
};

onMounted(() => {
  loadRuns();
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="Postmaster Runs" />
      <div class="flex gap-2">
        <router-link to="/postmaster/inbox" class="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover">Inbox Monitor</router-link>
      </div>
    </div>

    <div class="bg-surface rounded-xl border border-border overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-surface-alt border-b border-border">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-muted">ID</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Domain</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Status</th>
            <th class="px-4 py-3 text-right font-medium text-muted">Messages</th>
            <th class="px-4 py-3 text-right font-medium text-muted">New</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Started</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Finished</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading">
            <td colspan="8" class="px-4 py-8 text-center text-muted">Loading...</td>
          </tr>
          <tr v-else-if="runs.length === 0">
            <td colspan="8" class="px-4 py-8 text-center text-muted">No runs found</td>
          </tr>
          <tr v-for="run in runs" :key="run.id" class="hover:bg-surface-alt">
            <td class="px-4 py-3 text-muted">{{ run.id }}</td>
            <td class="px-4 py-3 text-fg font-medium">{{ run.domain }}</td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusBadge(run.status)]">{{ run.status }}</span>
            </td>
            <td class="px-4 py-3 text-muted text-right">{{ (run.messageCount || 0).toLocaleString() }}</td>
            <td class="px-4 py-3 text-muted text-right">{{ (run.newCount || 0).toLocaleString() }}</td>
            <td class="px-4 py-3 text-muted">{{ formatDate(run.startedAt) }}</td>
            <td class="px-4 py-3 text-muted">{{ formatDate(run.finishedAt) }}</td>
            <td class="px-4 py-3">
              <button @click="viewLog(run)" class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">View Log</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="showLogModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showLogModal = false">
        <div class="bg-surface rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 class="text-lg font-semibold text-fg">Run Log</h3>
            <button @click="showLogModal = false" class="text-muted hover:text-muted text-xl">&times;</button>
          </div>
          <div class="flex-1 overflow-auto p-6">
            <div v-if="logLoading" class="flex items-center justify-center py-12 text-muted">Loading...</div>
            <div v-else-if="logContent">
              <div class="mb-4 grid grid-cols-3 gap-4 text-sm">
                <div><span class="font-medium text-muted">Status:</span> {{ logContent.status }}</div>
                <div><span class="font-medium text-muted">Messages:</span> {{ logContent.messageCount }}</div>
                <div><span class="font-medium text-muted">New:</span> {{ logContent.newCount }}</div>
              </div>
              <pre v-if="logContent.errorLog" class="whitespace-pre-wrap text-sm text-red-700 bg-red-50 p-4 rounded">{{ logContent.errorLog }}</pre>
              <p v-else class="text-sm text-muted">No errors logged.</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
