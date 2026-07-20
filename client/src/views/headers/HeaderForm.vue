<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getHeader, createHeader, updateHeader } from '../../api/headers';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);

const form = ref({
  name: '', header: '', status: 'Activated',
});

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await getHeader(route.params.id);
      form.value = { ...form.value, ...data };
    } catch (e) {
      error.value = 'Failed to load header.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name) { error.value = 'Name is required.'; return; }
  if (!form.value.header) { error.value = 'Header content is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateHeader(route.params.id, form.value);
    } else {
      await createHeader(form.value);
    }
    router.push('/headers');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save header.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <PageHeader :title="isEdit ? 'Edit Header' : 'Add New Header'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
            </select>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-fg-secondary mb-1">Header Content *</label>
          <textarea v-model="form.header" rows="10" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none font-mono" placeholder="Paste email headers here..."></textarea>
        </div>

        <FormActions back-to="/headers" :saving="loading" submit-label="Save" />
      </form>
    </FormCard>
  </div>
</template>
