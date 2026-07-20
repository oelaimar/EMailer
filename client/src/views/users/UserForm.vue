<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUser, createUser, updateUser } from '../../api/users';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const saving = ref(false);
const error = ref('');

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  productionId: '',
  superUserStatus: 'Disabled',
  status: 'Activated',
});

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true;
    try {
      const { data } = await getUser(route.params.id);
      form.value = { ...form.value, ...data, password: '' };
    } catch (e) {
      error.value = 'Failed to load user.';
    } finally {
      loading.value = false;
    }
  }
});

const handleSubmit = async () => {
  error.value = '';
  saving.value = true;
  try {
    const payload = { ...form.value };
    if (isEdit.value && !payload.password) delete payload.password;
    if (isEdit.value) {
      await updateUser(route.params.id, payload);
    } else {
      await createUser(payload);
    }
    router.push('/users');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save.';
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl">
    <PageHeader :title="isEdit ? 'Edit User' : 'Add New User'" />

    <div v-if="loading" class="text-center py-12 text-muted">Loading...</div>

    <form v-else @submit.prevent="handleSubmit">
      <FormCard>
        <div v-if="error" class="mb-4 p-3 bg-danger-light border border-red-200 rounded-lg text-danger text-sm">{{ error }}</div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">First Name *</label>
            <input v-model="form.firstName" required class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Last Name *</label>
            <input v-model="form.lastName" required class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Email *</label>
            <input v-model="form.email" type="email" required class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">{{ isEdit ? 'Password (leave blank to keep)' : 'Password *' }}</label>
            <input v-model="form.password" type="password" :required="!isEdit" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Production ID</label>
            <input v-model="form.productionId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Super User Status</label>
            <select v-model="form.superUserStatus" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option>Activated</option>
              <option>Disabled</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option>Activated</option>
              <option>Inactivated</option>
            </select>
          </div>
        </div>

        <FormActions back-to="/users" :saving="saving" />
      </FormCard>
    </form>
  </div>
</template>
