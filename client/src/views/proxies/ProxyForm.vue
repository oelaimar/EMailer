<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProxy, createProxy, updateProxy } from '../../api/proxies';
import PageHeader from '../../components/common/PageHeader.vue';
import FormCard from '../../components/common/FormCard.vue';
import FormActions from '../../components/common/FormActions.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEdit = computed(() => !!route.params.id);

const form = ref({
  ip: '', port: '', username: '', password: '', type: 'HTTP', status: 'Activated',
});

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await getProxy(route.params.id);
      form.value = { ...form.value, ...data, port: data.port || '' };
    } catch (e) {
      error.value = 'Failed to load proxy data.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.ip) { error.value = 'IP is required.'; return; }
  if (!form.value.port) { error.value = 'Port is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await updateProxy(route.params.id, form.value);
    } else {
      await createProxy(form.value);
    }
    router.push('/proxies');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save proxy.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <PageHeader :title="(isEdit ? 'Edit' : 'Add New') + ' Proxy'" />

    <FormCard>
      <div v-if="error" class="mb-4 p-3 bg-danger-light border border-red-200 text-danger text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">IP Address *</label>
            <input v-model="form.ip" type="text" placeholder="192.168.1.1" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Port *</label>
            <input v-model="form.port" type="number" placeholder="3128" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Type</label>
            <select v-model="form.type" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="HTTP">HTTP</option>
              <option value="SOCKS5">SOCKS5</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Username</label>
            <input v-model="form.username" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Password</label>
            <input v-model="form.password" type="password" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="Activated">Activated</option>
              <option value="Inactivated">Inactivated</option>
            </select>
          </div>
        </div>

        <FormActions back-to="/proxies" :saving="loading" />
      </form>
    </FormCard>
  </div>
</template>
