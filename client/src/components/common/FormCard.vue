<script setup>
defineProps({
  title: { type: String, default: '' },
});
</script>

<template>
  <div class="bg-surface border border-border rounded-xl p-6">
    <h2 v-if="title" class="text-base font-semibold text-fg tracking-tight mb-4 pb-3 border-b border-border">{{ title }}</h2>
    <slot />
  </div>
</template>
