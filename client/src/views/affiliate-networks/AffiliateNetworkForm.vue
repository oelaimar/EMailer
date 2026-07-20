<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAffiliateNetwork, createAffiliateNetwork, updateAffiliateNetwork } from '../../api/affiliateNetworks';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);

const form = ref({ name: '', url: '', status: 'Activated' });

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await getAffiliateNetwork(route.params.id);
      form.value = { ...form.value, ...data };
    } catch (e) {
      error.value = 'Failed to load network data.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name) { error.value = 'Network name is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateAffiliateNetwork(route.params.id, form.value);
    } else {
      await createAffiliateNetwork(form.value);
    }
    router.push('/affiliate-networks');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save network.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <PageHeader :title="isEdit ? 'Edit Affiliate Network' : 'Add New Affiliate Network'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Network Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">URL</label>
            <input v-model="form.url" type="url" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
            </select>
          </div>
        </div>

        <FormActions back-to="/affiliate-networks" :saving="loading" submit-label="Save" />
      </form>
    </FormCard>
  </div>
</template>
