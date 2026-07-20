<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSmtpGroup, createSmtpGroup, updateSmtpGroup } from '../../api/smtpGroups';
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
    <PageHeader :title="(isEdit ? 'Edit' : 'Add New') + ' SMTP Group'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-danger-light border border-red-200 text-danger text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div v-if="!isEdit">
            <label class="block text-sm font-medium text-fg-secondary mb-1">Group Names (one per line)</label>
            <textarea v-model="form.names" rows="10" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" placeholder="Group 1&#10;Group 2&#10;Group 3"></textarea>
          </div>
          <div v-else>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Group Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Encryption</label>
            <select v-model="form.encryption" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="None">None</option>
              <option value="SSL">SSL</option>
              <option value="TLS">TLS</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
            </select>
          </div>
        </div>

        <FormActions back-to="/smtp-groups" :saving="loading" />
      </form>
    </FormCard>
  </div>
</template>
