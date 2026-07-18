<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { createCloudInstance } from '../../api/cloudInstances';
import { getCloudAccountsByProvider } from '../../api/cloudAccounts';

const router = useRouter();
const loading = ref(false);
const error = ref('');

const providers = [
  { value: 'aws', label: 'Amazon AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'do', label: 'Digital Ocean' },
  { value: 'hetzner', label: 'Hetzner' },
  { value: 'linode', label: 'Linode' },
  { value: 'ovh', label: 'OVH' },
  { value: 'scaleway', label: 'Scaleway' },
  { value: 'vultr', label: 'Vultr' },
  { value: 'atlantic', label: 'Atlantic' },
  { value: 'idcloud', label: 'IDCloud Host' },
  { value: 'google', label: 'Google Cloud' },
];

const osOptions = [
  { value: 'ubuntu-22.04', label: 'Ubuntu 22.04' },
  { value: 'ubuntu-20.04', label: 'Ubuntu 20.04' },
  { value: 'debian-12', label: 'Debian 12' },
  { value: 'debian-11', label: 'Debian 11' },
  { value: 'centos-9', label: 'CentOS 9' },
  { value: 'rocky-9', label: 'Rocky Linux 9' },
];

const instanceTypes = {
  aws: ['T2Micro', 'T2Small', 'T2Medium', 'T2Large', 'T3Micro', 'T3Small', 'T3Medium', 'T3Large', 'M5Large', 'M5Xlarge'],
  azure: ['Standard_B1s', 'Standard_B1ms', 'Standard_B2s', 'Standard_B2ms', 'Standard_D2s_v3', 'Standard_D4s_v3'],
  do: ['s-1vcpu-1gb', 's-1vcpu-2gb', 's-2vcpu-2gb', 's-2vcpu-4gb', 's-4vcpu-8gb'],
  hetzner: ['cx11', 'cx21', 'cx31', 'cx41', 'cx51', 'cpx11', 'cpx21', 'cpx31'],
  linode: ['g6-nanode-1', 'g6-standard-1', 'g6-standard-2', 'g6-standard-4', 'g6-standard-6'],
  ovh: ['b2-30', 'b2-60', 'b2-120', 'c2-15', 'c2-30', 'c2-60'],
  scaleway: ['DEV1-S', 'DEV1-M', 'DEV1-L', 'GP1-S', 'GP1-M', 'GP1-L'],
  vultr: ['vc2-1c-1gb', 'vc2-1c-2gb', 'vc2-2c-4gb', 'vc2-4c-8gb'],
  atlantic: ['basic-1T', 'basic-2T', 'basic-4T', 'basic-8T'],
  idcloud: ['1vCPU-1GB', '2vCPU-2GB', '2vCPU-4GB', '4vCPU-8GB'],
  google: ['e2-micro', 'e2-small', 'e2-medium', 'e2-standard-2', 'e2-standard-4'],
};

const form = ref({
  provider: 'aws',
  cloudAccountId: '',
  numberOfInstances: 1,
  regions: [],
  os: 'ubuntu-22.04',
  instanceType: 'T2Micro',
  privateIps: 1,
  storage: 10,
});

const accounts = ref([]);

const loadAccounts = async () => {
  try {
    const { data } = await getCloudAccountsByProvider(form.value.provider);
    accounts.value = data.data;
  } catch (e) {
    accounts.value = [];
  }
};

onMounted(loadAccounts);

const handleProviderChange = () => {
  form.value.instanceType = instanceTypes[form.value.provider]?.[0] || '';
  form.value.cloudAccountId = '';
  loadAccounts();
};

const handleSubmit = async () => {
  if (!form.value.instanceType) { error.value = 'Instance type is required.'; return; }
  loading.value = true;
  error.value = '';
  try {
    await createCloudInstance(form.value);
    router.push('/cloud-instances');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to create instance.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Create Cloud Instances</h1>
      <router-link to="/cloud-instances" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
            <select v-model="form.provider" @change="handleProviderChange" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option v-for="p in providers" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cloud Account</label>
            <select v-model="form.cloudAccountId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Number of Instances</label>
            <input v-model.number="form.numberOfInstances" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Instance Type *</label>
            <select v-model="form.instanceType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option v-for="t in instanceTypes[form.provider] || []" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Operating System</label>
            <select v-model="form.os" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option v-for="o in osOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Private IPs</label>
            <input v-model.number="form.privateIps" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Storage (GB)</label>
            <input v-model.number="form.storage" type="number" min="10" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="loading" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Creating...' : 'Create Instances' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
