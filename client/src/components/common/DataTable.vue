<script setup>
import { ref, watch, onMounted, computed } from 'vue';

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

const loadData = async () => {
  loading.value = true;
  try {
    const params = { page: page.value, limit: limit.value, search: search.value };
    const result = await props.fetchData(params);
    data.value = result.data;
    total.value = result.total;
  } catch (e) {
    data.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

watch(page, loadData);
watch(search, () => { page.value = 1; loadData(); });
watch(selected, (val) => { emit('update:selected', [...val]); }, { deep: true });
onMounted(loadData);

const totalPages = computed(() => Math.ceil(total.value / limit.value));
const selectAll = ref(false);

watch(data, () => {
  if (data.value.length > 0 && selected.value.length > 0) {
    selectAll.value = data.value.every((r) => selected.value.includes(r.id));
  } else {
    selectAll.value = false;
  }
});

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
  <div>
    <div v-if="groupActions.length && selected.length" class="bg-primary-light border border-primary-muted rounded-lg px-4 py-2.5 mb-3 flex items-center gap-3 text-sm">
      <span class="text-primary font-medium">{{ selected.length }} selected</span>
      <div class="flex items-center gap-2 ml-auto">
        <button
          v-for="ga in groupActions"
          :key="ga.label"
          @click="$emit('group-action', { action: ga.action, ids: selected }); selected = []; selectAll = false"
          class="px-2.5 py-1 text-xs font-medium border border-primary-muted rounded-md bg-surface text-primary hover:bg-primary-light"
        >
          {{ ga.label }}
        </button>
      </div>
    </div>

    <div class="flex items-center gap-3 mb-3 flex-wrap">
      <div class="relative flex-1 min-w-[200px] max-w-[320px]">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input v-model="search" placeholder="Search..." class="w-full py-2 pl-9 pr-3 border border-border rounded-lg bg-surface text-fg text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_oklch(55%_0.18_255/0.08)] transition-all" />
      </div>
      <slot name="header-actions" />
    </div>

    <div class="bg-surface border border-border rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-surface-alt border-b border-border">
              <th v-if="selectable" class="px-4 py-3 text-left">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="rounded" />
              </th>
              <th v-for="col in columns" :key="col.key" class="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">
                {{ col.label }}
              </th>
              <th v-if="actions.length" class="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="columns.length + (selectable ? 1 : 0) + (actions.length ? 1 : 0)" class="px-4 py-8 text-center text-muted">
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
              <td :colspan="columns.length + (selectable ? 1 : 0) + (actions.length ? 1 : 0)" class="px-4 py-8 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-surface-alt flex items-center justify-center">
                    <svg class="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  </div>
                  <span class="text-sm text-muted">No data found</span>
                </div>
              </td>
            </tr>
            <tr v-for="row in data" :key="row.id" class="border-b border-border-light hover:bg-surface-alt/50 transition-colors">
              <td v-if="selectable" class="px-4 py-3">
                <input type="checkbox" :checked="selected.includes(row.id)" @change="toggleSelect(row.id)" class="rounded" />
              </td>
              <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-sm text-fg-secondary">
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                  {{ row[col.key] }}
                </slot>
              </td>
              <td v-if="actions.length" class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button v-for="action in actions" :key="action.label" @click="action.handler(row)" :class="['px-2 py-1 text-xs rounded-lg', action.class || 'bg-surface-alt hover:bg-surface']">
                    {{ action.label }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-4 py-3 border-t border-border flex items-center justify-between flex-wrap gap-3">
        <span class="text-sm text-muted">
          Showing <strong class="text-fg-secondary">{{ (page - 1) * limit + 1 }}</strong> to <strong class="text-fg-secondary">{{ Math.min(page * limit, total) }}</strong> of <strong class="text-fg-secondary">{{ total }}</strong>
        </span>
        <div class="flex items-center gap-2">
          <button @click="page--" :disabled="page <= 1" class="min-w-[32px] h-8 flex items-center justify-center border border-transparent rounded-md text-sm font-medium text-fg-secondary hover:bg-surface-alt hover:border-border transition-all disabled:opacity-50">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span class="text-sm text-muted">Page {{ page }}</span>
          <button @click="page++" :disabled="page >= totalPages" class="min-w-[32px] h-8 flex items-center justify-center border border-transparent rounded-md text-sm font-medium text-fg-secondary hover:bg-surface-alt hover:border-border transition-all disabled:opacity-50">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>
          <select v-model="limit" @change="page = 1; loadData()" class="py-1 px-2 border border-border rounded-md bg-surface text-fg text-sm cursor-pointer outline-none focus:border-primary">
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
