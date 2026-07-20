<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDomain, createDomain, updateDomain } from '../../api/domains';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);

const form = ref({
  name: '',
  accountName: '',
  status: 'Activated',
  availability: 'Available',
  expirationDate: '',
  country: '',
});

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await getDomain(route.params.id);
      form.value = { ...form.value, ...data, expirationDate: data.expirationDate ? data.expirationDate.split('T')[0] : '' };
    } catch (e) {
      error.value = 'Failed to load domain data.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name) {
    error.value = 'Domain name is required.';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateDomain(route.params.id, form.value);
    } else {
      await createDomain(form.value);
    }
    router.push('/domains');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save domain.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <PageHeader :title="(isEdit ? 'Edit' : 'Add') + ' Domain'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-danger-light border border-red-200 text-danger text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Domain Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" placeholder="example.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Account Name</label>
            <input v-model="form.accountName" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Country</label>
            <input v-model="form.country" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
              <option value="Special">Special</option>
              <option value="Privat">Privat</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Availability</label>
            <select v-model="form.availability" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="Available">Available</option>
              <option value="Taken">Taken</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Expiration Date</label>
            <input v-model="form.expirationDate" type="date" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <FormActions back-to="/domains" :saving="loading" />
      </form>
    </FormCard>
  </div>
</template>
