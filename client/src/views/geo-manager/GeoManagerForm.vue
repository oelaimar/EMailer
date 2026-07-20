<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToastStore } from '../../stores/toast';
import {
  getGeoManagerProcess, createGeoManagerProcess,
  getGeoSchemas, getGeoSourceTables
} from '../../api/geoManager';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = ref(!!route.params.id);

const form = ref({
  name: '',
  sourceSchema: '',
  sourceTables: [],
  targetGeos: [],
  batchSize: 500,
  tablePattern: 'e_',
  duplicateMode: 'delete',
  scheduledAt: '',
  targetRows: 0,
});

const schemas = ref([]);
const tables = ref([]);
const loadingTables = ref(false);
const geoText = ref('');

const COUNTRY_CODES = [
  'US','UK','CA','AU','DE','FR','NL','SE','NO','DK','FI','IE','IT','ES','PT',
  'BR','MX','AR','CL','CO','PE','JP','KR','CN','IN','SG','MY','TH','PH','ID',
  'VN','HK','TW','NZ','ZA','NG','KE','EG','IL','AE','SA','TR','RU','PL','CZ',
  'RO','HU','BG','HR','SK','SI','LT','LV','EE','UA','GR','CH','AT','BE','LU',
];

onMounted(async () => {
  try {
    const { data } = await getGeoSchemas();
    schemas.value = data.data || [];
  } catch (e) {
    toastStore.showToast('Failed to load data', 'error');
  }
  if (isEdit.value) {
    try {
      const { data } = await getGeoManagerProcess(route.params.id);
      form.value = {
        ...form.value, ...data,
        sourceTables: Array.isArray(data.sourceTables) ? data.sourceTables : [],
        targetGeos: Array.isArray(data.targetGeos) ? data.targetGeos : [],
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString().slice(0, 16) : '',
      };
      geoText.value = form.value.targetGeos.join('\n');
      if (form.value.sourceSchema) {
        await loadTables(form.value.sourceSchema);
      }
    } catch (e) {
      error.value = 'Failed to load process.';
    }
  }
});

const loadTables = async (schema) => {
  if (!schema) { tables.value = []; return; }
  loadingTables.value = true;
  try {
    const { data } = await getGeoSourceTables({ schema });
    tables.value = data.data || [];
  } catch (e) {
    toastStore.showToast('Failed to load data', 'error');
    tables.value = [];
  } finally {
    loadingTables.value = false;
  }
};

watch(() => form.value.sourceSchema, (val) => {
  form.value.sourceTables = [];
  loadTables(val);
});

const toggleTable = (tableName) => {
  const idx = form.value.sourceTables.indexOf(tableName);
  if (idx >= 0) {
    form.value.sourceTables.splice(idx, 1);
  } else {
    form.value.sourceTables.push(tableName);
  }
};

const selectMatchingTables = () => {
  if (!form.value.tablePattern) return;
  form.value.sourceTables = tables.value
    .filter(t => t.name.startsWith(form.value.tablePattern))
    .map(t => t.name);
};

const selectAllTables = () => {
  form.value.sourceTables = tables.value.map(t => t.name);
};

const handleSubmit = async () => {
  if (!form.value.name) { error.value = 'Name is required.'; return; }
  if (!form.value.sourceSchema) { error.value = 'Source schema is required.'; return; }
  if (form.value.sourceTables.length === 0) { error.value = 'Select at least one source table.'; return; }

  const geos = geoText.value.split('\n').map(g => g.trim()).filter(Boolean);
  if (geos.length === 0) { error.value = 'Enter at least one target geo.'; return; }

  loading.value = true;
  error.value = '';
  try {
    await createGeoManagerProcess({
      ...form.value,
      targetGeos: geos,
      targetRows: form.value.targetRows || 0,
      scheduledAt: form.value.scheduledAt || null,
    });
    router.push('/geo-manager');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save process.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <PageHeader :title="isEdit ? 'Edit Geo Manager Process' : 'Add New Geo Manager Process'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <h3 class="text-sm font-semibold text-fg-secondary mb-3">Process Info</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Name *</label>
            <input v-model="form.name" type="text" placeholder="e.g. US Distribution" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Batch Size</label>
            <input v-model.number="form.batchSize" type="number" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Duplicate Mode</label>
            <select v-model="form.duplicateMode" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="delete">Delete Existing Duplicates</option>
              <option value="keep">Keep Existing Duplicates</option>
              <option value="flag">Flag Duplicates</option>
            </select>
          </div>
        </div>

        <h3 class="text-sm font-semibold text-fg-secondary mb-3">Source Selection</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Source Schema *</label>
            <select v-model="form.sourceSchema" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="">Select schema...</option>
              <option v-for="s in schemas" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Table Pattern</label>
            <div class="flex gap-2">
              <input v-model="form.tablePattern" type="text" class="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
              <button type="button" @click="selectMatchingTables" class="px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200">Select Matching</button>
            </div>
          </div>
        </div>

        <div v-if="form.sourceSchema" class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-fg-secondary">Source Tables * ({{ form.sourceTables.length }} selected)</label>
            <button type="button" @click="selectAllTables" class="text-xs text-primary hover:underline">Select All</button>
          </div>
          <div v-if="loadingTables" class="text-sm text-muted py-2">Loading tables...</div>
          <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
            <label v-for="t in tables" :key="t.name" class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" :checked="form.sourceTables.includes(t.name)" @change="toggleTable(t.name)" class="rounded" />
              <span class="truncate">{{ t.name }}</span>
              <span class="text-xs text-muted">({{ t.rowCount.toLocaleString() }})</span>
            </label>
          </div>
        </div>

        <h3 class="text-sm font-semibold text-fg-secondary mb-3">Target Geos</h3>
        <div class="mb-2">
          <label class="block text-sm text-muted mb-1">Enter country codes, one per line (e.g. US, UK, CA)</label>
          <textarea v-model="geoText" rows="6" placeholder="US&#10;UK&#10;CA" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none font-mono"></textarea>
        </div>
        <div class="flex flex-wrap gap-1 mb-6">
          <button v-for="code in COUNTRY_CODES" :key="code" type="button"
            @click="geoText += (geoText ? '\n' : '') + code"
            class="px-2 py-0.5 text-xs bg-surface-alt text-muted rounded hover:bg-surface">
            {{ code }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Schedule At (optional)</label>
            <input v-model="form.scheduledAt" type="datetime-local" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <FormActions back-to="/geo-manager" :saving="loading" submit-label="Create Process" />
      </form>
    </FormCard>
  </div>
</template>
