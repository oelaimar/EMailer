<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getMailbox, createMailbox, updateMailbox, getMailboxDomains } from '../../api/mailboxes';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);
const domains = ref([]);

const form = ref({
  domainId: '', email: '', status: 'Activated',
});

onMounted(async () => {
  try {
    const { data } = await getMailboxDomains();
    domains.value = data.data || [];
  } catch (e) { /* ignore */ }

  if (isEdit.value) {
    try {
      const { data } = await getMailbox(route.params.id);
      form.value = {
        ...form.value, ...data,
        domainId: data.domainId || '',
      };
    } catch (e) {
      error.value = 'Failed to load mailbox.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.domainId) { error.value = 'Domain is required.'; return; }
  if (!form.value.email) { error.value = 'Email is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateMailbox(route.params.id, form.value);
    } else {
      await createMailbox(form.value);
    }
    router.push('/mailboxes');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save mailbox.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Edit' : 'Add New' }} Mailbox</h1>
      <router-link to="/mailboxes" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Domain *</label>
            <select v-model="form.domainId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select domain</option>
              <option v-for="d in domains" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input v-model="form.email" type="text" placeholder="user@example.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
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
