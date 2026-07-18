<script setup>
const props = defineProps({
  show: Boolean,
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  confirmClass: { type: String, default: 'bg-red-600 hover:bg-red-700 text-white' },
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="emit('cancel')">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button @click="emit('cancel')" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">{{ cancelText }}</button>
          <button @click="emit('confirm')" :class="['px-4 py-2 text-sm rounded-lg font-medium', confirmClass]">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
