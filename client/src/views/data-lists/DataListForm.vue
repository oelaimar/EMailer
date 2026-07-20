<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDataList, createDataList, updateDataList } from '../../api/dataLists';
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
  country: '',
  vertical: '',
  isp: '',
  encryptEmails: 'Disabled',
  status: 'Activated',
});

const verticals = [
  'CPL Lead Gen', 'Uncategorized', 'Education', 'E-commerce',
  'Nutra - Keto', 'Nutra - Health', 'Nutra - Health & Beauty', 'Adult Dating',
];

const isps = ['gmail', 'hotmail', 'yahoo'];

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await getDataList(route.params.id);
      form.value = { ...form.value, ...data };
    } catch (e) {
      error.value = 'Failed to load data list.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name) {
    error.value = 'List name is required.';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateDataList(route.params.id, form.value);
    } else {
      await createDataList(form.value);
    }
    router.push('/data-lists');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save data list.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <PageHeader :title="isEdit ? 'Edit Data List' : 'Add New Data List'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">List Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" placeholder="Enter List Name" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">ISP</label>
            <select v-model="form.isp" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="">Select ISP</option>
              <option v-for="isp in isps" :key="isp" :value="isp">{{ isp }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Country</label>
            <input v-model="form.country" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" placeholder="e.g. US" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Vertical</label>
            <select v-model="form.vertical" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="">Select Vertical</option>
              <option v-for="v in verticals" :key="v" :value="v">{{ v }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Encrypt Emails</label>
            <select v-model="form.encryptEmails" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="Disabled">Disabled</option>
              <option value="Enabled">Enabled</option>
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

        <FormActions back-to="/data-lists" :saving="loading" submit-label="Save" />
      </form>
    </FormCard>
  </div>
</template>
