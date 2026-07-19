<script setup>
import { ref, onMounted } from 'vue';
import { getPostmasterRuns, getPostmasterRunLogs } from '../../api/postmaster';

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
    console.error('Failed to load runs:', e);
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
    console.error('Failed to load log:', e);
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
  return map[status] || 'bg-gray-100 text-gray-700';
};

onMounted(() => {
  loadRuns();
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Postmaster Runs</h1>
      <div class="flex gap-2">
        <router-link to="/postmaster/inbox" class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Inbox Monitor</router-link>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-600">ID</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Domain</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            <th class="px-4 py-3 text-right font-medium text-gray-600">Messages</th>
            <th class="px-4 py-3 text-right font-medium text-gray-600">New</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Started</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Finished</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading">
            <td colspan="8" class="px-4 py-8 text-center text-gray-400">Loading...</td>
          </tr>
          <tr v-else-if="runs.length === 0">
            <td colspan="8" class="px-4 py-8 text-center text-gray-400">No runs found</td>
          </tr>
          <tr v-for="run in runs" :key="run.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-600">{{ run.id }}</td>
            <td class="px-4 py-3 text-gray-800 font-medium">{{ run.domain }}</td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusBadge(run.status)]">{{ run.status }}</span>
            </td>
            <td class="px-4 py-3 text-gray-600 text-right">{{ (run.messageCount || 0).toLocaleString() }}</td>
            <td class="px-4 py-3 text-gray-600 text-right">{{ (run.newCount || 0).toLocaleString() }}</td>
            <td class="px-4 py-3 text-gray-600">{{ formatDate(run.startedAt) }}</td>
            <td class="px-4 py-3 text-gray-600">{{ formatDate(run.finishedAt) }}</td>
            <td class="px-4 py-3">
              <button @click="viewLog(run)" class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">View Log</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="showLogModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showLogModal = false">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Run Log</h3>
            <button @click="showLogModal = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="flex-1 overflow-auto p-6">
            <div v-if="logLoading" class="flex items-center justify-center py-12 text-gray-400">Loading...</div>
            <div v-else-if="logContent">
              <div class="mb-4 grid grid-cols-3 gap-4 text-sm">
                <div><span class="font-medium text-gray-600">Status:</span> {{ logContent.status }}</div>
                <div><span class="font-medium text-gray-600">Messages:</span> {{ logContent.messageCount }}</div>
                <div><span class="font-medium text-gray-600">New:</span> {{ logContent.newCount }}</div>
              </div>
              <pre v-if="logContent.errorLog" class="whitespace-pre-wrap text-sm text-red-700 bg-red-50 p-4 rounded">{{ logContent.errorLog }}</pre>
              <p v-else class="text-sm text-gray-500">No errors logged.</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
