<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProduction, createSendProcess } from '../../api/production';
import { getDataLists } from '../../api/dataLists';
import { getSmtpGroups } from '../../api/smtpGroups';
import { getMtaServers } from '../../api/mtaServers';
import { getOffers } from '../../api/offers';
import { getVirtualLists } from '../../api/virtualLists';
import { getSmtpServers } from '../../api/smtpServers';
import { getHeaders } from '../../api/headers';

const route = useRoute();
const router = useRouter();
const productionId = route.params.id;
const loading = ref(false);
const error = ref('');
const success = ref('');
const step = ref(1);
const totalSteps = 5;
const productionName = ref('');

const dataLists = ref([]);
const smtpGroups = ref([]);
const mtaServers = ref([]);
const offers = ref([]);
const virtualLists = ref([]);
const smtpServers = ref([]);
const headersList = ref([]);

const form = ref({
  processName: '', subject: '', fromEmail: '', fromName: '', replyTo: '',
  senderScore: '', throttle: 0, speed: 100, scheduleAt: '', repeat: '',
  dataListId: '', smtpGroupId: '', mtaServerId: '', offerId: '', virtualListId: '',
  batchSize: 100, batchDelay: 10, rotationType: 'round-robin',
  headersRotation: false, bodyRotation: false, rcptRotation: false,
  returnPath: '', contentEncoding: 'none',
  headersList: '', bodiesList: '', rcptList: '',
  linkType: 'tracking', trackingDomain: '', physicalAddress: '',
  unsubscribeLink: true, previewText: '', preheaderText: '',
  launchNow: false, testMode: false, testEmails: '',
});

onMounted(async () => {
  try {
    const { data } = await getProduction(productionId);
    productionName.value = data.name;
  } catch (e) { /* ignore */ }
  try {
    const [dl, sg, ms, of, vl, ss, hl] = await Promise.all([
      getDataLists({ limit: 1000 }), getSmtpGroups({ limit: 1000 }),
      getMtaServers({ limit: 1000 }), getOffers({ limit: 1000 }),
      getVirtualLists({ limit: 1000 }), getSmtpServers({ limit: 1000 }),
      getHeaders({ limit: 1000 }),
    ]);
    dataLists.value = dl.data.data; smtpGroups.value = sg.data.data;
    mtaServers.value = ms.data.data; offers.value = of.data.data;
    virtualLists.value = vl.data.data; smtpServers.value = ss.data.data;
    headersList.value = hl.data.data;
  } catch (e) { /* ignore */ }
});

const stepNames = ['Identity', 'Content', 'Targeting', 'Advanced', 'Launch'];

const canProceed = computed(() => {
  if (step.value === 1) return form.value.processName;
  return true;
});

const nextStep = () => { if (step.value < totalSteps && canProceed.value) step.value++; };
const prevStep = () => { if (step.value > 1) step.value--; };

const handleLaunch = async () => {
  loading.value = true; error.value = ''; success.value = '';
  try {
    await createSendProcess(productionId, form.value);
    success.value = form.value.testMode ? 'Test campaign launched successfully!' : 'Campaign launched successfully!';
    setTimeout(() => router.push(`/production/${productionId}/processes`), 2000);
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to launch campaign.';
  } finally { loading.value = false; }
};

const insertMergeTag = (tag) => { form.value.subject = (form.value.subject || '') + tag; };
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Launch Campaign — {{ productionName }}</h1>
      <router-link :to="`/production/${productionId}/processes`" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back to Processes</router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div class="flex items-center">
        <div v-for="(name, idx) in stepNames" :key="idx" class="flex items-center">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', step > idx + 1 ? 'bg-emerald-500 text-white' : step === idx + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500']">
            {{ step > idx + 1 ? '&#10003;' : idx + 1 }}
          </div>
          <span :class="['ml-2 text-sm', step === idx + 1 ? 'font-semibold text-gray-800' : 'text-gray-500']">{{ name }}</span>
          <div v-if="idx < stepNames.length - 1" class="w-12 h-px bg-gray-300 mx-3"></div>
        </div>
      </div>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
    <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div v-if="step === 1">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Campaign Identity</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Process Name *</label>
            <input v-model="form.processName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Summer Blast 2026" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Offer</label>
            <select v-model="form.offerId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="o in offers" :key="o.id" :value="o.id">{{ o.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data List</label>
            <select v-model="form.dataListId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="dl in dataLists" :key="dl.id" :value="dl.id">{{ dl.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Virtual List</label>
            <select v-model="form.virtualListId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="v in virtualLists" :key="v.id" :value="v.id">{{ v.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="step === 2">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Email Content</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium text-gray-700">Subject Line</label>
              <div class="flex gap-1">
                <button @click="insertMergeTag('{{firstname}}')" class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200">First Name</button>
                <button @click="insertMergeTag('{{lastname}}')" class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200">Last Name</button>
                <button @click="insertMergeTag('{{email}}')" class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200">Email</button>
              </div>
            </div>
            <input v-model="form.subject" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Subject line with {{merge_tags}}" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From Name</label>
            <input v-model="form.fromName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From Email</label>
            <input v-model="form.fromEmail" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Reply To</label>
            <input v-model="form.replyTo" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Return Path</label>
            <input v-model="form.returnPath" type="text" placeholder="bounces@domain.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Preview Text</label>
            <input v-model="form.previewText" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Preheader</label>
            <input v-model="form.preheaderText" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Link Type</label>
            <select v-model="form.linkType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="tracking">Click Tracking</option>
              <option value="direct">Direct Links</option>
              <option value="custom">Custom Domain</option>
            </select>
          </div>
          <div v-if="form.linkType === 'custom'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tracking Domain</label>
            <input v-model="form.trackingDomain" type="text" placeholder="track.yourdomain.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div class="md:col-span-2 flex items-center gap-6">
            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.unsubscribeLink" type="checkbox" class="rounded" />
              <span class="text-gray-700">Include Unsubscribe Link</span>
            </label>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Physical Address (CAN-SPAM)</label>
            <input v-model="form.physicalAddress" type="text" placeholder="123 Main St, City, State 12345" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </div>

      <div v-if="step === 3">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Targeting & Routing</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Group</label>
            <select v-model="form.smtpGroupId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="g in smtpGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">MTA Server</label>
            <select v-model="form.mtaServerId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option v-for="m in mtaServers" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">VMTA Rotation</label>
            <select v-model="form.rotationType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="round-robin">Round Robin</option>
              <option value="random">Random</option>
              <option value="weighted">Weighted</option>
              <option value="least-used">Least Used</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sender Score Threshold</label>
            <input v-model="form.senderScore" type="number" min="0" max="100" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="flex items-center gap-2 text-sm mb-2">
              <input v-model="form.headersRotation" type="checkbox" class="rounded" />
              <span class="text-gray-700">Headers Rotation</span>
            </label>
            <label class="flex items-center gap-2 text-sm mb-2">
              <input v-model="form.bodyRotation" type="checkbox" class="rounded" />
              <span class="text-gray-700">Body Rotation</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.rcptRotation" type="checkbox" class="rounded" />
              <span class="text-gray-700">RCPT Rotation</span>
            </label>
          </div>
        </div>
      </div>

      <div v-if="step === 4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Advanced Settings</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Batch Size</label>
            <input v-model.number="form.batchSize" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Batch Delay (sec)</label>
            <input v-model.number="form.batchDelay" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Throttle</label>
            <input v-model.number="form.throttle" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Speed (%)</label>
            <input v-model.number="form.speed" type="number" min="1" max="100" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Content Encoding</label>
            <select v-model="form.contentEncoding" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="none">None</option>
              <option value="7bit">7bit</option>
              <option value="8bit">8bit</option>
              <option value="base64">Base64</option>
              <option value="quoted-printable">Quoted-Printable</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
            <input v-model="form.scheduleAt" type="datetime-local" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
            <select v-model="form.repeat" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="step === 5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Launch Campaign</h2>
        <div class="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
          <div class="grid grid-cols-2 gap-2">
            <div><span class="text-gray-500">Process:</span> <span class="font-medium text-gray-800">{{ form.processName || '-' }}</span></div>
            <div><span class="text-gray-500">Subject:</span> <span class="font-medium text-gray-800">{{ form.subject || '-' }}</span></div>
            <div><span class="text-gray-500">From:</span> <span class="font-medium text-gray-800">{{ form.fromName }} &lt;{{ form.fromEmail }}&gt;</span></div>
            <div><span class="text-gray-500">Offer:</span> <span class="font-medium text-gray-800">{{ offers.find(o => o.id == form.offerId)?.name || '-' }}</span></div>
            <div><span class="text-gray-500">Data List:</span> <span class="font-medium text-gray-800">{{ dataLists.find(d => d.id == form.dataListId)?.name || '-' }}</span></div>
            <div><span class="text-gray-500">SMTP Group:</span> <span class="font-medium text-gray-800">{{ smtpGroups.find(g => g.id == form.smtpGroupId)?.name || '-' }}</span></div>
            <div><span class="text-gray-500">MTA:</span> <span class="font-medium text-gray-800">{{ mtaServers.find(m => m.id == form.mtaServerId)?.name || '-' }}</span></div>
            <div><span class="text-gray-500">Speed:</span> <span class="font-medium text-gray-800">{{ form.speed }}%</span></div>
            <div><span class="text-gray-500">Batch:</span> <span class="font-medium text-gray-800">{{ form.batchSize }} / {{ form.batchDelay }}s delay</span></div>
            <div><span class="text-gray-500">Rotation:</span> <span class="font-medium text-gray-800">{{ form.rotationType }}</span></div>
            <div><span class="text-gray-500">Encoding:</span> <span class="font-medium text-gray-800">{{ form.contentEncoding }}</span></div>
            <div><span class="text-gray-500">Link Type:</span> <span class="font-medium text-gray-800">{{ form.linkType }}</span></div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="flex items-center gap-2 text-sm mb-2">
              <input v-model="form.testMode" type="checkbox" class="rounded" />
              <span class="text-gray-700 font-medium">Test Mode (send test emails only)</span>
            </label>
            <textarea v-if="form.testMode" v-model="form.testEmails" rows="3" placeholder="test@email.com, other@email.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>
          <div class="flex items-end justify-end">
            <button @click="handleLaunch" :disabled="loading || !form.processName" class="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium rounded-lg transition-colors text-lg">
              {{ loading ? 'Launching...' : form.testMode ? 'Send Test' : 'Launch Campaign' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between">
      <button v-if="step > 1" @click="prevStep" class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors">Previous</button>
      <div v-else></div>
      <button v-if="step < totalSteps" @click="nextStep" :disabled="!canProceed" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">Next</button>
    </div>
  </div>
</template>
