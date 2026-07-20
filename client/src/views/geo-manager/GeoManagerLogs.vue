<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import { getGeoManagerLogs } from '../../api/geoManager';
import { useRoute, useRouter } from 'vue-router';
import PageHeader from '../../components/common/PageHeader.vue';

const route = useRoute();
const router = useRouter();
const logs = ref([]);
const loading = ref(false);
const error = ref('');
const processId = route.params.id;

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'action', label: 'Action' },
  { key: 'details', label: 'Details' },
  { key: 'createdAt', label: 'Time' },
];

onMounted(async () => {
  loading.value = true;
  try {
    const { data } = await getGeoManagerLogs(processId);
    logs.value = data || [];
  } catch (e) {
    error.value = 'Failed to load logs.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader :title="`Geo Manager Logs — Process #${processId}`" />
      <button @click="router.push('/geo-manager')" class="px-4 py-2 bg-surface-alt hover:bg-surface-alt text-fg-secondary text-sm font-medium rounded-lg transition-colors">Back to List</button>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

    <div class="bg-surface rounded-xl border border-border overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-muted text-sm">Loading...</div>
      <div v-else-if="logs.length === 0" class="p-6 text-center text-muted text-sm">No logs found.</div>
      <table v-else class="w-full text-sm">
        <thead class="bg-surface-alt border-b border-border">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-muted">ID</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Action</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Details</th>
            <th class="px-4 py-3 text-left font-medium text-muted">Time</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-surface-alt">
            <td class="px-4 py-3 text-fg">{{ log.id }}</td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', log.action === 'Started' ? 'bg-success-light text-success' : log.action === 'Stopped' ? 'bg-danger-light text-danger' : 'bg-blue-100 text-blue-700']">
                {{ log.action }}
              </span>
            </td>
            <td class="px-4 py-3 text-muted">{{ log.details }}</td>
            <td class="px-4 py-3 text-muted">{{ new Date(log.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
