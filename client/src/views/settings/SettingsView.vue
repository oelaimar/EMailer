<script setup>
import { ref, onMounted } from 'vue';
import { getSettings, updateSettings } from '../../api/settings';
import { useToastStore } from '../../stores/toast';
import PageHeader from '../../components/common/PageHeader.vue';
const toastStore = useToastStore();

const loading = ref(false);
const error = ref('');
const success = ref('');

const form = ref({
  company: 'Vugex V2',
  name: 'Vugex V2',
  version: '5.0',
  'new-tab-open': 'same',
  'sidebar-behaviour': 'expended',
  'suppression-timer': '5',
  'tracking-enc-key': '',
  'ssl-email': '',
  'gcloud-bucket-size': '20',
  'gcloud-object-size': '20',
  'azure-change-ips-callback': 'restart',
  'bit-api-token': '',
  'lejumo-api-key': '',
  'image-host-imgur-client-id': '',
  'image-host-imgbb-api-key': '',
  'image-host-freeimage-host-api-key': '',
  'image-host-im-ge-api-key': '',
  'image-host-imgpile-api-token': '',
  'image-host-imgchest-api-token': '',
  'optizmo-token': '',
  'telegram-api-token': '',
  'chat-id': '',
  'postmaster-export-password': '',
  'postmaster-export-password-confirm': '',
  'pmta-version': 'pmta45',
  'pmta-http-port': '5022',
  'pmta-firewall-ips-domains': '',
  'mta-header': '',
  'smtp-header': '',
  'gsuite-header': '',
  'gcloud-cert': '',
  'app-allowed-firewall': 'none',
  'app-firewall-ips-domains': '',
});

onMounted(async () => {
  try {
    const { data } = await getSettings();
    Object.keys(form.value).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        form.value[key] = typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key]);
      }
    });
  } catch (e) {
    toastStore.showToast('Failed to load data', 'error');
  }
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    await updateSettings(form.value);
    success.value = 'Settings updated successfully.';
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save settings.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="Application Settings" />
    </div>

    <div class="bg-surface rounded-xl border border-border p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

      <form @submit.prevent="handleSubmit">
        <h4 class="text-lg font-semibold text-fg mb-3 border-b pb-2">General Settings</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Company Name</label>
            <input v-model="form.company" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Application Name</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Version</label>
            <input v-model="form.version" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Page Open Behavior</label>
            <select v-model="form['new-tab-open']" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="same">Open In Same Tab</option>
              <option value="new">Open In New Tab</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Menu Behavior</label>
            <select v-model="form['sidebar-behaviour']" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="closed">Closed</option>
              <option value="expended">Expended</option>
            </select>
          </div>
        </div>

        <h4 class="text-lg font-semibold text-fg mb-3 border-b pb-2">Application Settings</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Suppression Interval</label>
            <select v-model="form['suppression-timer']" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="1">1 Day</option>
              <option value="5">5 Days</option>
              <option value="7">7 Days</option>
              <option value="10">10 Days</option>
              <option value="15">15 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Tracking Encryption Key</label>
            <input v-model="form['tracking-enc-key']" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">SSL Email</label>
            <input v-model="form['ssl-email']" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Azure Change Behavior</label>
            <select v-model="form['azure-change-ips-callback']" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="none">No Action</option>
              <option value="pause-resume">Pause/Resume Queues</option>
              <option value="schedule">Schedule Queues</option>
              <option value="restart">Restart PMTA</option>
            </select>
          </div>
        </div>

        <h4 class="text-lg font-semibold text-fg mb-3 border-b pb-2">Integration Credentials</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Bitly Token</label>
            <input v-model="form['bit-api-token']" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Lejumo API Key</label>
            <input v-model="form['lejumo-api-key']" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Optizmo Token</label>
            <input v-model="form['optizmo-token']" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <h4 class="text-lg font-semibold text-fg mb-3 border-b pb-2">Image Hosting</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Imgur Client ID</label>
            <input v-model="form['image-host-imgur-client-id']" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">ImgBB API Key</label>
            <input v-model="form['image-host-imgbb-api-key']" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Freeimage.host API Key</label>
            <input v-model="form['image-host-freeimage-host-api-key']" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <h4 class="text-lg font-semibold text-fg mb-3 border-b pb-2">Notifications & Compliance</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Telegram Token</label>
            <input v-model="form['telegram-api-token']" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Chat ID</label>
            <input v-model="form['chat-id']" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>

        <h4 class="text-lg font-semibold text-fg mb-3 border-b pb-2">Production Settings</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">PMTA Version</label>
            <select v-model="form['pmta-version']" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="pmta40">Power MTA 4.0r8</option>
              <option value="pmta45">Power MTA 4.5r11</option>
              <option value="pmta50">Power MTA 5.0r3</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">PMTA HTTP Port</label>
            <input v-model="form['pmta-http-port']" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Default MTA Header</label>
            <textarea v-model="form['mta-header']" rows="8" class="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:border-primary outline-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Default SMTP Header</label>
            <textarea v-model="form['smtp-header']" rows="8" class="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:border-primary outline-none"></textarea>
          </div>
        </div>

        <h4 class="text-lg font-semibold text-fg mb-3 border-b pb-2">Firewall Settings</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Type Firewall</label>
            <select v-model="form['app-allowed-firewall']" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none">
              <option value="none">None</option>
              <option value="direct_ips">Direct IPs</option>
              <option value="dynamic_dns">Dynamic DNS</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Direct IPs or Dynamic DNS</label>
            <textarea v-model="form['app-firewall-ips-domains']" rows="4" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:border-primary outline-none"></textarea>
          </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="loading" class="px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary-muted text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Updating...' : 'Update' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
