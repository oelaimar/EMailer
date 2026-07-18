<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProduction, createProduction, updateProduction } from '../../api/production';

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
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Edit' : 'Add New' }} Production</h1>
      <router-link to="/production" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Production Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="loading" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
