<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTeam, createTeam, updateTeam } from '../../api/teams';
import { getIsps } from '../../api/isps';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);

const form = ref({ name: '', status: 'Activated', isps: [] });

const ispOptions = ref([]);

onMounted(async () => {
  try {
    const { data } = await getIsps({ limit: 1000 });
    ispOptions.value = (data.data || []).filter((i) => i.status === 'Activated').map((i) => i.name);
  } catch { ispOptions.value = []; }

  if (isEdit.value) {
    try {
      const { data } = await getTeam(route.params.id);
      form.value = { ...form.value, ...data, isps: data.isps || [] };
    } catch (e) {
      error.value = 'Failed to load Team.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name) { error.value = 'Name is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateTeam(route.params.id, form.value);
    } else {
      await createTeam(form.value);
    }
    router.push('/teams');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save Team.';
  } finally {
    loading.value = false;
  }
};

const toggleIsp = (isp) => {
  const idx = form.value.isps.indexOf(isp);
  if (idx > -1) form.value.isps.splice(idx, 1);
  else form.value.isps.push(isp);
};
</script>

<template>
  <div>
    <PageHeader :title="isEdit ? 'Edit Team' : 'Add New Team'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Team Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
            </select>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-fg-secondary mb-2">ISPs</label>
          <div class="flex gap-2">
            <button v-for="isp in ispOptions" :key="isp" type="button" @click="toggleIsp(isp)"
              :class="['px-4 py-2 text-sm rounded-lg border transition-colors', form.isps.includes(isp) ? 'bg-primary text-white border-primary' : 'bg-surface text-fg-secondary border-border hover:bg-surface-alt']">
              {{ isp }}
            </button>
          </div>
        </div>

        <FormActions back-to="/teams" :saving="loading" submit-label="Save" />
      </form>
    </FormCard>
  </div>
</template>
