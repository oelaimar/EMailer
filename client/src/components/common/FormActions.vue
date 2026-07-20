<script setup>
defineProps({
  backTo: { type: String, default: '' },
  backLabel: { type: String, default: 'Back to List' },
  submitLabel: { type: String, default: 'Save' },
  saving: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});
</script>

<template>
  <div class="flex items-center justify-between pt-4 border-t border-border mt-6">
    <router-link v-if="backTo" :to="backTo" class="px-4 py-2 text-sm font-medium border border-border rounded-lg bg-surface text-fg hover:bg-surface-alt transition-all">
      {{ backLabel }}
    </router-link>
    <div v-else></div>
    <button type="submit" :disabled="saving || loading" class="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
      <span v-if="saving" class="flex items-center gap-2">
        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        Saving...
      </span>
      <span v-else>{{ submitLabel }}</span>
    </button>
  </div>
</template>
