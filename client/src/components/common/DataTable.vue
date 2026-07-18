<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  columns: { type: Array, required: true },
  fetchData: { type: Function, required: true },
  selectable: { type: Boolean, default: false },
  actions: { type: Array, default: () => [] },
  groupActions: { type: Array, default: () => [] },
});

const emit = defineEmits(['row-click', 'group-action', 'update:selected']);

const data = ref([]);
const total = ref(0);
const page = ref(1);
const limit = ref(25);
const loading = ref(true);
const search = ref('');
const selected = ref([]);
const filters = ref({});

const loadData = async () => {
  loading.value = true;
  try {
    const params = { page: page.value, limit: limit.value, search: search.value, ...filters.value };
    const result = await fetchData(params);
    data.value = result.data;
    total.value = result.total;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

watch(page, loadData);
watch(search, () => { page.value = 1; });
watch(selected, (val) => { emit('update:selected', [...val]); }, { deep: true });

const totalPages = () => Math.ceil(total.value / limit.value);
const selectAll = ref(false);

const toggleSelectAll = () => {
  if (selectAll.value) {
    selected.value = data.value.map((r) => r.id);
  } else {
    selected.value = [];
  }
};

const toggleSelect = (id) => {
  const idx = selected.value.indexOf(id);
  if (idx > -1) selected.value.splice(idx, 1);
  else selected.value.push(id);
};

defineExpose({ loadData });
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200">
    <div v-if="groupActions.length && selected.length" class="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
      <span class="text-sm text-gray-600">{{ selected.length }} selected</span>
      <button v-for="ga in groupActions" :key="ga.label" @click="$emit('group-action', { action: ga.action, ids: selected }); selected = []; selectAll = false" :class="['px-3 py-1 text-xs font-medium rounded-lg border', ga.class]">
        {{ ga.label }}
      </button>
    </div>

    <div class="px-6 py-4 flex items-center justify-between border-b border-gray-200">
      <input v-model="search" placeholder="Search..." class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" />
      <slot name="header-actions" />
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th v-if="selectable" class="px-4 py-3 text-left">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="rounded" />
            </th>
            <th v-for="col in columns" :key="col.key" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              {{ col.label }}
            </th>
            <th v-if="actions.length" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length + (selectable ? 1 : 0) + (actions.length ? 1 : 0)" class="px-4 py-8 text-center text-gray-500">
              <div class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </div>
            </td>
          </tr>
          <tr v-else-if="data.length === 0">
            <td :colspan="columns.length + (selectable ? 1 : 0) + (actions.length ? 1 : 0)" class="px-4 py-8 text-center text-gray-500">
              No data found.
            </td>
          </tr>
          <tr v-for="row in data" :key="row.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td v-if="selectable" class="px-4 py-3">
              <input type="checkbox" :checked="selected.includes(row.id)" @change="toggleSelect(row.id)" class="rounded" />
            </td>
            <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-sm text-gray-700">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
            <td v-if="actions.length" class="px-4 py-3">
              <div class="flex items-center gap-2">
                <button v-for="action in actions" :key="action.label" @click="action.handler(row)" :class="['px-2 py-1 text-xs rounded-lg', action.class || 'bg-gray-100 hover:bg-gray-200']">
                  {{ action.label }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="px-6 py-4 flex items-center justify-between border-t border-gray-200">
      <span class="text-sm text-gray-500">Showing {{ (page - 1) * limit + 1 }} to {{ Math.min(page * limit, total) }} of {{ total }}</span>
      <div class="flex items-center gap-2">
        <button @click="page--" :disabled="page <= 1" class="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Prev</button>
        <span class="text-sm text-gray-600">Page {{ page }}</span>
        <button @click="page++" :disabled="page >= totalPages()" class="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Next</button>
      </div>
    </div>
  </div>
</template>
