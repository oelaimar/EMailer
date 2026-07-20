<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOffer, createOffer, updateOffer } from '../../api/offers';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

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
    <PageHeader :title="(isEdit ? 'Edit' : 'Add New') + ' Offer'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-danger-light border border-red-200 text-danger text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Offer Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Offer URL</label>
            <input v-model="form.url" type="url" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">From Name</label>
            <input v-model="form.fromName" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">From Email</label>
            <input v-model="form.fromEmail" type="email" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Subject</label>
            <input v-model="form.subject" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Reply To</label>
            <input v-model="form.replyTo" type="email" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-fg-secondary mb-1">Headers</label>
            <textarea v-model="form.headers" rows="4" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" placeholder="X-Custom: value"></textarea>
          </div>
        </div>

        <FormActions back-to="/offers" :saving="loading" />
      </form>
    </FormCard>
  </div>
</template>
