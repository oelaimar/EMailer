<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOffer, createOffer, updateOffer } from '../../api/offers';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);

const form = ref({
  name: '', url: '', fromName: '', fromEmail: '', subject: '', replyTo: '', headers: '',
});

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await getOffer(route.params.id);
      form.value = { ...form.value, ...data };
    } catch (e) {
      error.value = 'Failed to load offer data.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name) { error.value = 'Offer name is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateOffer(route.params.id, form.value);
    } else {
      await createOffer(form.value);
    }
    router.push('/offers');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save offer.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Edit' : 'Add New' }} Offer</h1>
      <router-link to="/offers" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Offer Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Offer URL</label>
            <input v-model="form.url" type="url" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From Name</label>
            <input v-model="form.fromName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From Email</label>
            <input v-model="form.fromEmail" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input v-model="form.subject" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Reply To</label>
            <input v-model="form.replyTo" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Headers</label>
            <textarea v-model="form.headers" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="X-Custom: value"></textarea>
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
