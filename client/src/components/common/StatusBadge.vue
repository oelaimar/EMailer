<script setup>
defineProps({
  value: { type: String, required: true },
});

const colorMap = {
  Activated: { bg: 'bg-success-light', text: 'text-success', dot: 'bg-success' },
  Active: { bg: 'bg-success-light', text: 'text-success', dot: 'bg-success' },
  Inactivated: { bg: 'bg-surface-alt', text: 'text-muted', dot: 'bg-muted' },
  Inactive: { bg: 'bg-surface-alt', text: 'text-muted', dot: 'bg-muted' },
  Pending: { bg: 'bg-warning-light', text: 'text-warning', dot: 'bg-warning' },
  Error: { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger' },
  Failed: { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger' },
  Connected: { bg: 'bg-success-light', text: 'text-success', dot: 'bg-success' },
  Disconnected: { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger' },
};

const getStatusStyle = (val) => colorMap[val] || { bg: 'bg-surface-alt', text: 'text-muted', dot: 'bg-muted' };
</script>

<template>
  <span :class="['inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full', getStatusStyle(value).bg, getStatusStyle(value).text]">
    <span :class="['w-1.5 h-1.5 rounded-full', getStatusStyle(value).dot]"></span>
    {{ value }}
  </span>
</template>
