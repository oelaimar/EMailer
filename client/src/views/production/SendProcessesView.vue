<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DataTable from '../../components/common/DataTable.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import { getSendProcesses, deleteSendProcess, getProduction } from '../../api/production';
import { getDataLists } from '../../api/dataLists';
import { getSmtpGroups } from '../../api/smtpGroups';
import { getMtaServers } from '../../api/mtaServers';
import { getOffers } from '../../api/offers';
import { getVirtualLists } from '../../api/virtualLists';
import { useToastStore } from '../../stores/toast';
import PageHeader from '../../components/common/PageHeader.vue';
const toastStore = useToastStore();

const route = useRoute();
const router = useRouter();
const productionId = route.params.id;
const productionName = ref('');
const tableRef = ref(null);
const confirmDialog = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);
const loading = ref(false);
const showForm = ref(false);

const dataLists = ref([]);
const smtpGroups = ref([]);
const mtaServers = ref([]);
const offers = ref([]);
const virtualLists = ref([]);

const form = ref({
  processName: '', subject: '', fromEmail: '', fromName: '', replyTo: '',
  senderScore: '', throttle: 0, speed: 100, scheduleAt: '', repeat: '',
  dataListId: '', smtpGroupId: '', mtaServerId: '', offerId: '', virtualListId: '',
  batchSize: 100, batchDelay: 10, rotationType: 'round-robin',
  headersRotation: false, bodyRotation: false, rcptRotation: false,
  returnPath: '', contentEncoding: 'none',
  headersList: '', bodiesList: '', rcptList: '',
});

onMounted(async () => {
  try {
    const { data } = await getProduction(productionId);
    productionName.value = data.name;
  } catch (e) { /* ignore */ }

  try {
    const [dl, sg, ms, of, vl] = await Promise.all([
      getDataLists({ limit: 1000 }),
      getSmtpGroups({ limit: 1000 }),
      getMtaServers({ limit: 1000 }),
      getOffers({ limit: 1000 }),
      getVirtualLists({ limit: 1000 }),
    ]);
    dataLists.value = dl.data.data;
    smtpGroups.value = sg.data.data;
    mtaServers.value = ms.data.data;
    offers.value = of.data.data;
    virtualLists.value = vl.data.data;
  } catch (e) { /* ignore */ }
});

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'processName', label: 'Process Name' },
  { key: 'subject', label: 'Subject' },
  { key: 'fromEmail', label: 'From' },
  { key: 'dataList', label: 'Data List', format: (v) => v?.name || '-' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
];

const actions = [
  { label: 'Delete', class: 'bg-danger-light text-danger hover:bg-red-200', handler: (row) => {
    confirmMessage.value = `Delete process "${row.processName}"?`;
    confirmAction.value = () => deleteSendProcess(productionId, row.id).then(() => tableRef.value?.loadData());
    confirmDialog.value = true;
  }},
];

const handleAdd = async () => {
  if (!form.value.processName) return;
  loading.value = true;
  try {
    await (await import('../../api/production')).createSendProcess(productionId, form.value);
    form.value = {
      processName: '', subject: '', fromEmail: '', fromName: '', replyTo: '',
      senderScore: '', throttle: 0, speed: 100, scheduleAt: '', repeat: '',
      dataListId: '', smtpGroupId: '', mtaServerId: '', offerId: '', virtualListId: '',
      batchSize: 100, batchDelay: 10, rotationType: 'round-robin',
      headersRotation: false, bodyRotation: false, rcptRotation: false,
      returnPath: '', contentEncoding: 'none',
      headersList: '', bodiesList: '', rcptList: '',
    };
    showForm.value = false;
    tableRef.value?.loadData();
  } catch (e) { toastStore.showToast('Action failed', 'error'); } finally {
    loading.value = false;
  }
};

const handleConfirm = async () => {
  loading.value = true;
  try { await confirmAction.value(); } catch (e) { toastStore.showToast('Action failed', 'error'); }
  loading.value = false;
  confirmDialog.value = false;
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageHeader title="Send Processes — {{ productionName }}" />
      <div class="flex gap-2">
        <button @click="showForm = !showForm" class="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors">
          {{ showForm ? 'Cancel' : '+ New Process' }}
        </button>
        <router-link to="/production" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">
          Back to Production
        </router-link>
      </div>
    </div>

    <div v-if="showForm" class="bg-surface rounded-xl border border-border p-6 mb-6">
      <h2 class="text-lg font-semibold text-fg mb-4">New Send Process</h2>
      <form @submit.prevent="handleAdd">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Process Name *</label>
            <input v-model="form.processName" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Subject</label>
            <input v-model="form.subject" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">From Name</label>
            <input v-model="form.fromName" type="text" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">From Email</label>
            <input v-model="form.fromEmail" type="email" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Reply To</label>
            <input v-model="form.replyTo" type="email" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Sender Score</label>
            <input v-model="form.senderScore" type="number" min="0" max="100" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Throttle</label>
            <input v-model.number="form.throttle" type="number" min="0" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Speed (%)</label>
            <input v-model.number="form.speed" type="number" min="0" max="100" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Schedule</label>
            <input v-model="form.scheduleAt" type="datetime-local" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Repeat</label>
            <select v-model="form.repeat" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Data List</label>
            <select v-model="form.dataListId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="dl in dataLists" :key="dl.id" :value="dl.id">{{ dl.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">SMTP Group</label>
            <select v-model="form.smtpGroupId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="g in smtpGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">MTA Server</label>
            <select v-model="form.mtaServerId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="m in mtaServers" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Offer</label>
            <select v-model="form.offerId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="o in offers" :key="o.id" :value="o.id">{{ o.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-fg-secondary mb-1">Virtual List</label>
            <select v-model="form.virtualListId" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="v in virtualLists" :key="v.id" :value="v.id">{{ v.name }}</option>
            </select>
          </div>
        </div>

        <div class="border-t border-border pt-4 mb-4">
          <h3 class="text-sm font-semibold text-fg-secondary mb-3">Advanced Send Options</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-fg-secondary mb-1">Batch Size</label>
              <input v-model.number="form.batchSize" type="number" min="1" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-fg-secondary mb-1">Batch Delay (sec)</label>
              <input v-model.number="form.batchDelay" type="number" min="0" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-fg-secondary mb-1">VMTA Rotation</label>
              <select v-model="form.rotationType" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="round-robin">Round Robin</option>
                <option value="random">Random</option>
                <option value="weighted">Weighted</option>
                <option value="least-used">Least Used</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-fg-secondary mb-1">Return Path</label>
              <input v-model="form.returnPath" type="text" placeholder="bounces@domain.com" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-fg-secondary mb-1">Content Encoding</label>
              <select v-model="form.contentEncoding" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="none">None</option>
                <option value="7bit">7bit</option>
                <option value="8bit">8bit</option>
                <option value="base64">Base64</option>
                <option value="quoted-printable">Quoted-Printable</option>
              </select>
            </div>
            <div class="flex items-end gap-4">
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.headersRotation" type="checkbox" class="rounded" />
                <span class="text-fg-secondary">Headers Rotation</span>
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.bodyRotation" type="checkbox" class="rounded" />
                <span class="text-fg-secondary">Body Rotation</span>
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.rcptRotation" type="checkbox" class="rounded" />
                <span class="text-fg-secondary">RCPT Rotation</span>
              </label>
            </div>
          </div>
        </div>

        <div v-if="form.headersRotation || form.bodyRotation || form.rcptRotation" class="border-t border-border pt-4 mb-4">
          <h3 class="text-sm font-semibold text-fg-secondary mb-3">Rotation Lists (one per line)</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-if="form.headersRotation">
              <label class="block text-sm font-medium text-fg-secondary mb-1">Headers (JSON or text)</label>
              <textarea v-model="form.headersList" rows="5" placeholder='{"From": "name <email>"}' class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"></textarea>
            </div>
            <div v-if="form.bodyRotation">
              <label class="block text-sm font-medium text-fg-secondary mb-1">Body Variants</label>
              <textarea v-model="form.bodiesList" rows="5" placeholder="HTML content per line..." class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"></textarea>
            </div>
            <div v-if="form.rcptRotation">
              <label class="block text-sm font-medium text-fg-secondary mb-1">RCPT Values</label>
              <textarea v-model="form.rcptList" rows="5" placeholder="One value per line..." class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"></textarea>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="loading" class="px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
            {{ loading ? 'Creating...' : 'Create Process' }}
          </button>
        </div>
      </form>
    </div>

    <DataTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="async (params) => (await getSendProcesses(productionId, params)).data"
    >
      <template #cell-status="{ value }">
        <span :class="['px-2 py-1 text-xs font-medium rounded-full',
          value === 'Running' ? 'bg-primary-light text-primary' :
          value === 'Completed' ? 'bg-success-light text-success' :
          value === 'Failed' ? 'bg-danger-light text-danger' :
          'bg-surface-alt text-muted']">
          {{ value }}
        </span>
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(value).toLocaleDateString() }}
      </template>
    </DataTable>

    <ConfirmDialog :show="confirmDialog" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" @confirm="handleConfirm" @cancel="confirmDialog = false" />
  </div>
</template>