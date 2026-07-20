<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProduction, createProduction, updateProduction } from '../../api/production';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);

const form = ref({ name: '' });

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await getProduction(route.params.id);
      form.value = { name: data.name };
    } catch (e) {
      error.value = 'Failed to load production data.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name) { error.value = 'Production name is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateProduction(route.params.id, form.value);
    } else {
      await createProduction(form.value);
    }
    router.push('/production');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save production.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <PageHeader :title="(isEdit ? 'Edit' : 'Add New') + ' Production'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-danger-light border border-red-200 text-danger text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Production Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <FormActions back-to="/production" :saving="loading" />
      </form>
    </FormCard>
  </div>
</template>
