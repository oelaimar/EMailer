<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOfferSuppressions, addOfferSuppression, deleteOfferSuppression } from '../../api/offers';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';

const route = useRoute();
const router = useRouter();
const offerId = route.params.id;
const suppressions = ref([]);
const loading = ref(false);
const error = ref('');
const showForm = ref(false);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);

const form = ref({ name: '', type: 'Email', data: '' });

const loadSuppressions = async () => {
  try {
    const { data } = await getOfferSuppressions(offerId);
    suppressions.value = data.data;
  } catch (e) {
    error.value = 'Failed to load suppressions.';
  }
};

onMounted(loadSuppressions);

const handleAdd = async () => {
  if (!form.value.name) { error.value = 'Suppression name is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    await addOfferSuppression(offerId, form.value);
    form.value = { name: '', type: 'Email', data: '' };
    showForm.value = false;
    await loadSuppressions();
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to add suppression.';
  } finally {
    loading.value = false;
  }
};

const handleDelete = (sup) => {
  confirmMessage.value = `Delete suppression "${sup.name}"?`;
  confirmAction.value = async () => {
    await deleteOfferSuppression(offerId, sup.id);
    await loadSuppressions();
  };
  confirmDialog.value = true;
};

const handleConfirm = async () => {
  loading.value = true;
  try { await confirmAction.value(); } catch (e) { console.error(e); }
  loading.value = false;
  confirmDialog.value = false;
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Suppression Lists</h1>
      <div class="flex gap-2">
        <button @click="showForm = !showForm" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          {{ showForm ? 'Cancel' : '+ Add Suppression' }}
        </button>
        <router-link to="/offers" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
          Back to Offers
        </router-link>
      </div>
    </div>

    <div v-if="showForm" class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <form @submit.prevent="handleAdd">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select v-model="form.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Email">Email</option>
              <option value="Domain">Domain</option>
              <option value="IP">IP</option>
            </select>
          </div>
          <div class="md:col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Data (one per line)</label>
            <textarea v-model="form.data" rows="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email1@example.com&#10;email2@example.com"></textarea>
          </div>
        </div>
        <div class="flex justify-end">
          <button type="submit" :disabled="loading" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Adding...' : 'Add Suppression' }}
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-xl border border-gray-200">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-600">ID</th>
              <th class="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th class="px-4 py-3 text-left font-medium text-gray-600">Type</th>
              <th class="px-4 py-3 text-left font-medium text-gray-600">Count</th>
              <th class="px-4 py-3 text-left font-medium text-gray-600">Created</th>
              <th class="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="!suppressions.length">
              <td colspan="6" class="px-4 py-8 text-center text-gray-400">No suppression lists found.</td>
            </tr>
            <tr v-for="sup in suppressions" :key="sup.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">{{ sup.id }}</td>
              <td class="px-4 py-3 font-medium">{{ sup.name }}</td>
              <td class="px-4 py-3">{{ sup.type }}</td>
              <td class="px-4 py-3">{{ sup.count }}</td>
              <td class="px-4 py-3">{{ new Date(sup.createdAt).toLocaleDateString() }}</td>
              <td class="px-4 py-3">
                <button @click="handleDelete(sup)" class="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-medium rounded-lg transition-colors">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>
