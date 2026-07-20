<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAutoResponder, createAutoResponder, updateAutoResponder } from '../../api/autoResponders';
import { getDataLists } from '../../api/dataLists';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);
const allDataLists = ref([]);

const form = ref({
  name: '', fromName: '', fromEmail: '', subject: '', delay: 0, headers: '', message: '', dataLists: [],
});

onMounted(async () => {
  try {
    const { data } = await getDataLists({ limit: 1000 });
    allDataLists.value = data.data;
  } catch (e) { /* ignore */ }

  if (isEdit.value) {
    try {
      const { data } = await getAutoResponder(route.params.id);
      form.value = { ...form.value, ...data, dataLists: data.lists?.map((l) => l.dataListId) || [] };
    } catch (e) {
      error.value = 'Failed to load auto responder data.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name) { error.value = 'Auto responder name is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateAutoResponder(route.params.id, form.value);
    } else {
      await createAutoResponder(form.value);
    }
    router.push('/auto-responders');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save auto responder.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <PageHeader :title="isEdit ? 'Edit Auto Responder' : 'Add New Auto Responder'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
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
            <label class="block text-sm font-medium text-fg-secondary mb-1">Delay (seconds)</label>
            <input v-model.number="form.delay" type="number" min="0" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-fg-secondary mb-1">Headers</label>
            <textarea v-model="form.headers" rows="3" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" placeholder="X-Custom: value"></textarea>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-fg-secondary mb-1">Message (HTML)</label>
            <textarea v-model="form.message" rows="8" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none font-mono"></textarea>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-fg-secondary mb-1">Data Lists</label>
            <select v-model="form.dataLists" multiple class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none h-32">
              <option v-for="dl in allDataLists" :key="dl.id" :value="dl.id">{{ dl.name }}</option>
            </select>
            <p class="text-xs text-muted mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>
        </div>

        <FormActions back-to="/auto-responders" :saving="loading" submit-label="Save" />
      </form>
    </FormCard>
  </div>
</template>
