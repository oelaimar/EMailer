<script setup>
defineProps({
  label: { type: String, required: true },
  for: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
});
</script>

<template>
  <div>
    <label :for="for" class="block text-sm font-medium text-fg-secondary mb-1.5">
      {{ label }}
      <span v-if="required" class="text-danger ml-0.5">*</span>
    </label>
    <slot />
    <p v-if="error" class="text-xs text-danger mt-1">{{ error }}</p>
  </div>
</template>
