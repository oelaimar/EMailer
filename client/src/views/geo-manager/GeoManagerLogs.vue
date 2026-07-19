<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '../../components/common/DataTable.vue';
import { getGeoManagerLogs } from '../../api/geoManager';
import { useRoute, useRouter } from 'vue-router';

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
      <h1 class="text-2xl font-bold text-gray-800">Geo Manager Logs — Process #{{ processId }}</h1>
      <button @click="router.push('/geo-manager')" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">Back to List</button>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-gray-500 text-sm">Loading...</div>
      <div v-else-if="logs.length === 0" class="p-6 text-center text-gray-500 text-sm">No logs found.</div>
      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-600">ID</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Action</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Details</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Time</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-800">{{ log.id }}</td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', log.action === 'Started' ? 'bg-emerald-100 text-emerald-700' : log.action === 'Stopped' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700']">
                {{ log.action }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ log.details }}</td>
            <td class="px-4 py-3 text-gray-500">{{ new Date(log.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
