<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getVirtualList, createVirtualList, updateVirtualList } from '../../api/virtualLists';
import { getSmtpGroups } from '../../api/smtpGroups';
import { getMtaServers } from '../../api/mtaServers';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);
const smtpGroups = ref([]);
const mtaServers = ref([]);

const form = ref({ name: '', smtpGroupId: '', mtaServerId: '' });

onMounted(async () => {
  try {
    const [sg, ms] = await Promise.all([
      getSmtpGroups({ limit: 1000 }),
      getMtaServers({ limit: 1000 }),
    ]);
    smtpGroups.value = sg.data.data;
    mtaServers.value = ms.data.data;
  } catch (e) { /* ignore */ }

  if (isEdit.value) {
    try {
      const { data } = await getVirtualList(route.params.id);
      form.value = { ...form.value, ...data, smtpGroupId: data.smtpGroupId || '', mtaServerId: data.mtaServerId || '' };
    } catch (e) {
      error.value = 'Failed to load virtual list data.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name) { error.value = 'Virtual list name is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateVirtualList(route.params.id, form.value);
    } else {
      await createVirtualList(form.value);
    }
    router.push('/virtual-lists');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save virtual list.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <PageHeader :title="isEdit ? 'Edit Virtual List' : 'Add New Virtual List'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">SMTP Group</label>
            <select v-model="form.smtpGroupId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="">None</option>
              <option v-for="g in smtpGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">MTA Server</label>
            <select v-model="form.mtaServerId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="">None</option>
              <option v-for="m in mtaServers" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
        </div>

        <FormActions back-to="/virtual-lists" :saving="loading" submit-label="Save" />
      </form>
    </FormCard>
  </div>
</template>
