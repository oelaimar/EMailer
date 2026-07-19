<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getPmtaTemplates, createPmtaTemplate, updatePmtaTemplate } from '../../api/pmta';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const error = ref('');
const isEdit = ref(false);

const form = ref({
  name: '',
  content: '',
  status: 'Activated',
});

onMounted(async () => {
  if (route.params.id) {
    isEdit.value = true;
    try {
      const { data } = await getPmtaTemplates({ page: 1, limit: 1000 });
      const template = (data.data || []).find((t) => t.id === parseInt(route.params.id, 10));
      if (template) {
        form.value = {
          name: template.name || '',
          content: template.content || '',
          status: template.status || 'Activated',
        };
      }
    } catch (e) {
      error.value = 'Failed to load template.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name.trim() || !form.value.content.trim()) return;
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updatePmtaTemplate(route.params.id, form.value);
    } else {
      await createPmtaTemplate(form.value);
    }
    router.push('/pmta/templates');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save template.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Edit Template' : 'New PMTA Template' }}</h1>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
            </select>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Template Content *</label>
          <textarea v-model="form.content" rows="16" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter PMTA template configuration..."></textarea>
        </div>

        <div class="flex justify-end gap-3">
          <button type="button" @click="router.push('/pmta/templates')" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">Cancel</button>
          <button type="submit" :disabled="loading || !form.name.trim() || !form.content.trim()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Saving...' : 'Save Template' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
