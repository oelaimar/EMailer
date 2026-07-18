<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSmtpGroup, createSmtpGroup, updateSmtpGroup } from '../../api/smtpGroups';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);

const form = ref({
  name: '',
  names: '',
  encryption: 'None',
  status: 'Activated',
});

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await getSmtpGroup(route.params.id);
      form.value = { ...form.value, ...data };
    } catch (e) {
      error.value = 'Failed to load group data.';
    }
  }
});

const handleSubmit = async () => {
  if (!isEdit.value && !form.value.names && !form.value.name) {
    error.value = 'Group name(s) are required.';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const payload = isEdit.value ? { name: form.value.name, encryption: form.value.encryption, status: form.value.status } : form.value;
    if (isEdit.value) {
      await updateSmtpGroup(route.params.id, payload);
    } else {
      await createSmtpGroup(payload);
    }
    router.push('/smtp-groups');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save group.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Edit' : 'Add New' }} SMTP Group</h1>
      <router-link to="/smtp-groups" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div v-if="!isEdit">
            <label class="block text-sm font-medium text-gray-700 mb-1">Group Names (one per line)</label>
            <textarea v-model="form.names" rows="10" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Group 1&#10;Group 2&#10;Group 3"></textarea>
          </div>
          <div v-else>
            <label class="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Encryption</label>
            <select v-model="form.encryption" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="None">None</option>
              <option value="SSL">SSL</option>
              <option value="TLS">TLS</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
            </select>
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
