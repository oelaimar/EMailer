<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getRole, createRole, updateRole } from '../../api/roles';

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const openSections = ref(['main']);

const form = ref({
  name: '',
  status: 'Activated',
  type: 'Team Based Role',
  permissions: {},
});

const permissionSections = [
  { id: 'main', label: 'Main Permissions', icon: 'app-store', items: [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'production', label: 'Production' },
    { key: 'smtp-servers', label: 'SMTP Servers' },
    { key: 'mta-servers', label: 'MTA Servers' },
    { key: 'smtp-groups', label: 'SMTP Groups' },
    { key: 'domains', label: 'Domains' },
    { key: 'data-lists', label: 'Data Lists' },
    { key: 'data-providers', label: 'Data Providers' },
    { key: 'offers', label: 'Offers' },
    { key: 'affiliate-networks', label: 'Affiliate Networks' },
    { key: 'virtual-lists', label: 'Virtual Lists' },
    { key: 'mailboxes', label: 'Mailboxes' },
    { key: 'headers', label: 'Headers' },
    { key: 'auto-responders', label: 'Auto Responders' },
    { key: 'isps', label: 'ISPs' },
    { key: 'proxies', label: 'Proxies' },
    { key: 'postmaster', label: 'Postmaster' },
    { key: 'users', label: 'Users' },
    { key: 'roles', label: 'Roles' },
    { key: 'teams', label: 'Teams' },
    { key: 'sessions', label: 'Sessions' },
    { key: 'settings', label: 'Settings' },
  ]},
  { id: 'tools', label: 'Tools Permissions', icon: 'android', items: [
    { key: 'tools-spf', label: 'Domains SPF Checker' },
    { key: 'tools-blacklist', label: 'Domains / IPs Reputation' },
    { key: 'tools-extractor', label: 'Mailbox Extractor' },
    { key: 'tools-values', label: 'Extract Values' },
  ]},
  { id: 'office365', label: 'Office365 Permissions', icon: 'microsoft', items: [
    { key: 'outlook-accounts', label: 'Outlook Accounts' },
    { key: 'outlook-send', label: 'Outlook Send' },
    { key: 'outlook-drops', label: 'Outlook Drops' },
    { key: 'outlook-tests', label: 'Outlook Tests' },
  ]},
  { id: 'gsuite', label: 'G-Suite API', icon: 'google', items: [
    { key: 'gsuite-accounts', label: 'GSuite Accounts' },
    { key: 'gsuite-send', label: 'GSuite Send' },
    { key: 'gsuite-drops', label: 'GSuite Drops' },
    { key: 'gsuite-tests', label: 'GSuite Tests' },
  ]},
  { id: 'gmail', label: 'Gmail API IDs', icon: 'google', items: [
    { key: 'gmail-accounts', label: 'Gmail Accounts' },
    { key: 'gmail-send', label: 'Gmail Send' },
    { key: 'gmail-drops', label: 'Gmail Drops' },
    { key: 'gmail-tests', label: 'Gmail Tests' },
  ]},
  { id: 'smtp-groups', label: 'SMTP Groups', icon: 'google', items: [
    { key: 'smtp-groups-list', label: 'Groups List' },
    { key: 'smtp-custom-vmtas', label: 'SMTP Custom VMTAs' },
    { key: 'smtp-send', label: 'SMTP Send' },
  ]},
  { id: 'aws', label: 'AWS API', icon: 'aws', items: [
    { key: 'aws-accounts', label: 'Accounts' },
    { key: 'aws-instances', label: 'Instances' },
  ]},
  { id: 'do', label: 'Digital Ocean API', icon: 'digital-ocean', items: [
    { key: 'do-accounts', label: 'Accounts' },
    { key: 'do-droplets', label: 'Droplets' },
  ]},
  { id: 'linode', label: 'Linode API', icon: 'linode', items: [
    { key: 'linode-accounts', label: 'Accounts' },
    { key: 'linode-instances', label: 'Instances' },
  ]},
  { id: 'hetzner', label: 'Hetzner API', icon: 'hetzner', items: [
    { key: 'hetzner-accounts', label: 'Accounts' },
    { key: 'hetzner-instances', label: 'Instances' },
  ]},
  { id: 'atlantic', label: 'Atlantic API', icon: 'atlantic', items: [
    { key: 'atlantic-accounts', label: 'Accounts' },
    { key: 'atlantic-instances', label: 'Instances' },
  ]},
  { id: 'scaleway', label: 'Scaleway API', icon: 'scaleway', items: [
    { key: 'scaleway-accounts', label: 'Accounts' },
    { key: 'scaleway-instances', label: 'Instances' },
  ]},
  { id: 'ovh', label: 'OVH API', icon: 'cloud', items: [
    { key: 'ovh-accounts', label: 'Accounts' },
    { key: 'ovh-instances', label: 'Instances' },
  ]},
  { id: 'vultr', label: 'Vultr API', icon: 'vuejs', items: [
    { key: 'vultr-accounts', label: 'Accounts' },
    { key: 'vultr-instances', label: 'Instances' },
  ]},
  { id: 'azure', label: 'Azure API', icon: 'microsoft', items: [
    { key: 'azure-accounts', label: 'Accounts' },
    { key: 'azure-instances', label: 'Instances' },
  ]},
  { id: 'idcloud', label: 'IDCloud Host API', icon: 'microsoft', items: [
    { key: 'idcloud-accounts', label: 'Accounts' },
    { key: 'idcloud-instances', label: 'Instances' },
  ]},
  { id: 'servers-providers', label: 'Servers Providers', icon: 'suitcase', items: [
    { key: 'servers-providers-add', label: 'Add' },
    { key: 'servers-providers-list', label: 'List' },
  ]},
  { id: 'management-servers', label: 'Management Servers', icon: 'server', items: [
    { key: 'mgmt-servers-add', label: 'Add' },
    { key: 'mgmt-servers-list', label: 'List' },
  ]},
  { id: 'cloudflare', label: 'Cloudflare Accounts', icon: 'globe', items: [
    { key: 'cloudflare-add', label: 'Add' },
    { key: 'cloudflare-list', label: 'List' },
  ]},
  { id: 'mta', label: 'MTA Servers', icon: 'server', items: [
    { key: 'mta-add', label: 'Add' },
    { key: 'mta-multi-add', label: 'Multi-Add' },
    { key: 'mta-list', label: 'List' },
    { key: 'mta-vmtas', label: 'VMTAs' },
    { key: 'mta-ips', label: 'Configure IPs' },
    { key: 'mta-install', label: 'Install' },
    { key: 'mta-bulk', label: 'Bulk Install' },
    { key: 'mta-actions', label: 'Actions' },
    { key: 'mta-proxies', label: 'Proxies' },
  ]},
  { id: 'smtp-servers-section', label: 'SMTP Servers', icon: 'cloud', items: [
    { key: 'smtp-add', label: 'Add' },
    { key: 'smtp-list', label: 'List' },
    { key: 'smtp-bulk-check', label: 'Bulk Check' },
  ]},
  { id: 'domains-section', label: 'Domains', icon: 'globe', items: [
    { key: 'domains-brands', label: 'Brands' },
    { key: 'domains-subdomains', label: 'Subdomains' },
    { key: 'domains-records', label: 'Records' },
    { key: 'domains-multi', label: 'Multi Records' },
  ]},
  { id: 'registrar-namecheap', label: 'Namecheap Accounts', icon: 'globe', items: [
    { key: 'namecheap-add', label: 'Add' },
    { key: 'namecheap-list', label: 'List' },
  ]},
  { id: 'registrar-godaddy', label: 'GoDaddy Accounts', icon: 'globe', items: [
    { key: 'godaddy-add', label: 'Add' },
    { key: 'godaddy-list', label: 'List' },
  ]},
  { id: 'registrar-dynadot', label: 'Dynadot Accounts', icon: 'globe', items: [
    { key: 'dynadot-add', label: 'Add' },
    { key: 'dynadot-list', label: 'List' },
  ]},
  { id: 'registrar-spaceship', label: 'Spaceship Accounts', icon: 'globe', items: [
    { key: 'spaceship-add', label: 'Add' },
    { key: 'spaceship-list', label: 'List' },
  ]},
  { id: 'registrar-namecom', label: 'Name.com Accounts', icon: 'globe', items: [
    { key: 'namecom-add', label: 'Add' },
    { key: 'namecom-list', label: 'List' },
  ]},
  { id: 'postmaster', label: 'Postmaster', icon: 'envelope', items: [
    { key: 'postmaster-dashboard', label: 'Dashboard' },
    { key: 'postmaster-runs', label: 'Runs' },
  ]},
  { id: 'geo', label: 'Geo Manager', icon: 'globe', items: [
    { key: 'geo-dashboard', label: 'Dashboard' },
    { key: 'geo-processes', label: 'Processes' },
  ]},
];

const toggleSection = (id) => {
  const idx = openSections.value.indexOf(id);
  if (idx > -1) openSections.value.splice(idx, 1);
  else openSections.value.push(id);
};

const togglePermission = (key) => {
  if (!form.value.permissions[key]) form.value.permissions[key] = { read: false, write: false, delete: false };
  const p = form.value.permissions[key];
  p.read = !p.read;
};

const toggleAllSection = (section) => {
  const allChecked = section.items.every((item) => form.value.permissions[item.key]?.read);
  section.items.forEach((item) => {
    if (!form.value.permissions[item.key]) form.value.permissions[item.key] = { read: false, write: false, delete: false };
    form.value.permissions[item.key].read = !allChecked;
    form.value.permissions[item.key].write = !allChecked;
    form.value.permissions[item.key].delete = !allChecked;
  });
};

const isAllChecked = (section) => section.items.every((item) => form.value.permissions[item.key]?.read);

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true;
    try {
      const { data } = await getRole(route.params.id);
      form.value = { ...form.value, ...data };
    } catch (e) {
      error.value = 'Failed to load role.';
    } finally {
      loading.value = false;
    }
  }
});

const handleSubmit = async () => {
  error.value = '';
  saving.value = true;
  try {
    if (isEdit.value) {
      await updateRole(route.params.id, form.value);
    } else {
      await createRole(form.value);
    }
    router.push('/roles');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save.';
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Edit Role' : 'Add New Role' }}</h1>
      <router-link to="/roles" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Back to List</router-link>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">Loading...</div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{{ error }}</div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
            <input v-model="form.name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Activated</option>
              <option>Inactivated</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select v-model="form.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Team Based Role</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 class="text-sm font-semibold text-gray-700 uppercase mb-4">Permissions</h3>

        <div v-for="section in permissionSections" :key="section.id" class="border border-gray-200 rounded-lg mb-3">
          <button type="button" @click="toggleSection(section.id)" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm">{{ section.label }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button type="button" @click.stop="toggleAllSection(section)" :class="['text-xs px-2 py-1 rounded', isAllChecked(section) ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600']">
                {{ isAllChecked(section) ? 'All Selected' : 'Select All' }}
              </button>
              <svg :class="['w-4 h-4 transition-transform', openSections.includes(section.id) ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div v-if="openSections.includes(section.id)" class="px-4 pb-3 grid grid-cols-3 gap-2">
            <label v-for="item in section.items" :key="item.key" class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input type="checkbox" :checked="form.permissions[item.key]?.read" @change="togglePermission(item.key)" class="rounded" />
              {{ item.label }}
            </label>
          </div>
        </div>
      </div>

      <button type="submit" :disabled="saving" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
        <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </form>
  </div>
</template>
