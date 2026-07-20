<script setup>
const props = defineProps({
  show: Boolean,
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  confirmClass: { type: String, default: 'bg-danger hover:bg-danger-light text-white' },
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="emit('cancel')">
        <Transition name="modal">
          <div class="dialog-card bg-surface border border-border rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-semibold text-fg tracking-tight mb-1">{{ title }}</h3>
            <p class="text-sm text-muted mb-6">{{ message }}</p>
            <div class="flex justify-end gap-3">
              <button @click="emit('cancel')" class="px-4 py-2 text-sm font-medium border border-border rounded-lg bg-surface text-fg hover:bg-surface-alt transition-all">{{ cancelText }}</button>
              <button @click="emit('confirm')" :class="['px-4 py-2 text-sm rounded-lg font-medium', confirmClass]">{{ confirmText }}</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active { transition: all 0.2s ease-out; }
.modal-leave-active { transition: all 0.15s ease-in; }
.modal-enter-from { opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-enter-from .dialog-card { opacity: 0; transform: scale(0.95) translateY(8px); }
.modal-leave-to .dialog-card { opacity: 0; transform: scale(0.98); }
</style>
