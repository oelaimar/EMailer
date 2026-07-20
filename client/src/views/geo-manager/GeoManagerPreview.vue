<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import PageHeader from '../../components/common/PageHeader.vue';
import {
  getGeoManagerProcess, getGeoSummary, startGeoManagerProcess
} from '../../api/geoManager';

const route = useRoute();
const router = useRouter();
const process = ref(null);
const summary = ref(null);
const loading = ref(true);
const starting = ref(false);
const showConfirm = ref(false);
const error = ref('');

onMounted(async () => {
  try {
    const { data } = await getGeoManagerProcess(route.params.id);
    process.value = data;

    if (data.sourceSchema && data.sourceTables?.length && data.targetGeos?.length) {
      const { data: sumData } = await getGeoSummary({
        schema: data.sourceSchema,
        tables: data.sourceTables,
        geos: data.targetGeos,
      });
      summary.value = sumData.data;
    }
  } catch (e) {
    error.value = 'Failed to load preview.';
  } finally {
    loading.value = false;
  }
});

const startProcess = async () => {
  starting.value = true;
  try {
    await startGeoManagerProcess(route.params.id);
    router.push('/geo-manager');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to start process.';
  } finally {
    starting.value = false;
    showConfirm.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader :title="`Preview: ${process?.name || 'Loading...'}`" />
      <div class="flex gap-2">
        <router-link to="/geo-manager" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg">Back</router-link>
        <button @click="showConfirm = true" :disabled="loading || starting || process?.status === 'Running'"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg">
          {{ starting ? 'Starting...' : 'Start Process' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

    <div v-if="loading" class="text-center py-12 text-muted">Loading preview...</div>

    <template v-else-if="process">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-blue-600">{{ summary?.totalRows?.toLocaleString() || 0 }}</p>
          <p class="text-xs text-muted mt-1">Total Rows</p>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ summary?.eligibleRows?.toLocaleString() || 0 }}</p>
          <p class="text-xs text-muted mt-1">Eligible Rows</p>
        </div>
        <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-purple-600">{{ process.sourceTables?.length || 0 }}</p>
          <p class="text-xs text-muted mt-1">Source Tables</p>
        </div>
        <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-orange-600">{{ process.targetGeos?.length || 0 }}</p>
          <p class="text-xs text-muted mt-1">Target Geos</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-surface rounded-xl border border-border overflow-hidden">
          <div class="px-4 py-3 bg-surface-alt border-b border-border">
            <h3 class="text-sm font-semibold text-fg-secondary">Source Tables</h3>
          </div>
          <table class="w-full text-sm">
            <thead class="border-b border-border-light">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted">Table</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-muted">Total Rows</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="t in summary?.tables || []" :key="t.name" class="hover:bg-surface-alt">
                <td class="px-4 py-2 text-fg font-medium">{{ t.name }}</td>
                <td class="px-4 py-2 text-muted text-right">{{ t.totalRows.toLocaleString() }}</td>
              </tr>
              <tr v-if="!summary?.tables?.length">
                <td colspan="2" class="px-4 py-4 text-center text-muted">No tables found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="bg-surface rounded-xl border border-border overflow-hidden">
          <div class="px-4 py-3 bg-surface-alt border-b border-border">
            <h3 class="text-sm font-semibold text-fg-secondary">Per-Geo Current Counts</h3>
          </div>
          <table class="w-full text-sm">
            <thead class="border-b border-border-light">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-muted">Geo</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-muted">Current</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="g in summary?.geos || []" :key="g.geo" class="hover:bg-surface-alt">
                <td class="px-4 py-2 text-fg font-medium">{{ g.geo }}</td>
                <td class="px-4 py-2 text-muted text-right">{{ g.current.toLocaleString() }}</td>
              </tr>
              <tr v-if="!summary?.geos?.length">
                <td colspan="2" class="px-4 py-4 text-center text-muted">No geo data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-surface-alt rounded-xl border border-border p-4 text-sm text-muted">
        <p><strong>Schema:</strong> {{ process.sourceSchema }}</p>
        <p><strong>Tables:</strong> {{ process.sourceTables?.join(', ') }}</p>
        <p><strong>Geos:</strong> {{ process.targetGeos?.join(', ') }}</p>
        <p><strong>Batch Size:</strong> {{ process.batchSize }} | <strong>Duplicate Mode:</strong> {{ process.duplicateMode }}</p>
      </div>
    </template>

    <ConfirmDialog
      :show="showConfirm"
      title="Start Process"
      :message="`Start geo distribution process '${process?.name}'? This will move rows across tables.`"
      confirm-text="Start"
      @confirm="startProcess"
      @cancel="showConfirm = false"
    />
  </div>
</template>
