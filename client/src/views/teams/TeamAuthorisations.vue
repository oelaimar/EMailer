<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTeam, getTeamAuthorizations, setTeamAuthorizations } from '../../api/teams';
import { getMtaServers } from '../../api/mtaServers';
import { getSmtpServers } from '../../api/smtpServers';
import { getOffers } from '../../api/offers';
import { getDataLists } from '../../api/dataLists';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const teamName = ref('');
const activeTab = ref(0);

const tabs = ['MTA Servers', 'SMTP Servers', 'Offers', 'Data Lists'];

const mtaServers = ref([]);
const smtpServers = ref([]);
const offers = ref([]);
const dataLists = ref([]);

const selectedMtaServers = ref([]);
const selectedSmtpServers = ref([]);
const selectedOffers = ref([]);
const selectedDataLists = ref([]);

const search = ref('');

const currentItems = computed(() => {
  const items = [mtaServers.value, smtpServers.value, offers.value, dataLists.value][activeTab.value] || [];
  if (!search.value) return items;
  const q = search.value.toLowerCase();
  return items.filter((item) => (item.name || item.host || '').toLowerCase().includes(q));
});

const currentSelected = computed(() => {
  return [selectedMtaServers.value, selectedSmtpServers.value, selectedOffers.value, selectedDataLists.value][activeTab.value] || [];
});

const toggleItem = (id) => {
  const arr = [selectedMtaServers, selectedSmtpServers, selectedOffers, selectedDataLists][activeTab.value];
  const idx = arr.value.indexOf(id);
  if (idx > -1) arr.value.splice(idx, 1);
  else arr.value.push(id);
};

const isSelected = (id) => currentSelected.value.includes(id);

const selectAll = () => {
  const arr = [selectedMtaServers, selectedSmtpServers, selectedOffers, selectedDataLists][activeTab.value];
  const items = [mtaServers.value, smtpServers.value, offers.value, dataLists.value][activeTab.value] || [];
  arr.value = items.map((i) => i.id);
};

const clearAll = () => {
  const arr = [selectedMtaServers, selectedSmtpServers, selectedOffers, selectedDataLists][activeTab.value];
  arr.value = [];
};

onMounted(async () => {
  try {
    const [{ data: team }, { data: auths }] = await Promise.all([
      getTeam(route.params.id),
      getTeamAuthorizations(route.params.id),
    ]);
    teamName.value = team.name;

    const [mtaRes, smtpRes, offerRes, dlRes] = await Promise.all([
      getMtaServers({ limit: 1000 }),
      getSmtpServers({ limit: 1000 }),
      getOffers({ limit: 1000 }),
      getDataLists({ limit: 1000 }),
    ]);
    mtaServers.value = mtaRes.data.data || [];
    smtpServers.value = smtpRes.data.data || [];
    offers.value = offerRes.data.data || [];
    dataLists.value = dlRes.data.data || [];

    if (auths.length > 0) {
      const auth = auths[0];
      selectedMtaServers.value = auth.mtaServers || [];
      selectedSmtpServers.value = auth.smtpServers || [];
      selectedOffers.value = auth.offers || [];
      selectedDataLists.value = auth.dataLists || [];
    }
  } catch (e) {
    error.value = 'Failed to load data.';
  }
});

const handleSave = async () => {
  loading.value = true;
  error.value = '';
  try {
    await setTeamAuthorizations(route.params.id, [{
      userId: null,
      mtaServers: selectedMtaServers.value,
      smtpServers: selectedSmtpServers.value,
      offers: selectedOffers.value,
      dataLists: selectedDataLists.value,
    }]);
    router.push('/teams');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save.';
  } finally {
    loading.value = false;
  }
};

const selectedCounts = computed(() => ({
  mta: selectedMtaServers.value.length,
  smtp: selectedSmtpServers.value.length,
  offers: selectedOffers.value.length,
  dataLists: selectedDataLists.value.length,
}));
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Manage Authorizations - {{ teamName }}</h1>
      <router-link to="/teams" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200">
      <div v-if="error" class="p-4 border-b border-gray-200 bg-red-50 text-red-700 text-sm">{{ error }}</div>

      <div class="border-b border-gray-200">
        <nav class="flex gap-0">
          <button v-for="(tab, i) in tabs" :key="i" @click="activeTab = i; search = ''"
            :class="['py-3 px-5 text-sm font-medium border-b-2 transition-colors', activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
            {{ tab }}
            <span v-if="[selectedCounts.mta, selectedCounts.smtp, selectedCounts.offers, selectedCounts.dataLists][i]" class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
              {{ [selectedCounts.mta, selectedCounts.smtp, selectedCounts.offers, selectedCounts.dataLists][i] }}
            </span>
          </button>
        </nav>
      </div>

      <div class="p-4 border-b border-gray-200 flex items-center gap-3">
        <input v-model="search" type="text" placeholder="Search..." class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        <button @click="selectAll" class="px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Select All</button>
        <button @click="clearAll" class="px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">Clear</button>
      </div>

      <div class="p-4 max-h-96 overflow-y-auto">
        <div v-if="currentItems.length === 0" class="text-center text-gray-400 text-sm py-8">No items found.</div>
        <label v-for="item in currentItems" :key="item.id" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input type="checkbox" :checked="isSelected(item.id)" @change="toggleItem(item.id)" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <span class="text-sm text-gray-800">{{ item.name || item.host || item.email || `#${item.id}` }}</span>
          <span v-if="item.status" :class="['ml-auto px-2 py-0.5 text-xs rounded-full', item.status === 'Activated' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500']">{{ item.status }}</span>
        </label>
      </div>

      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <router-link to="/teams" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">Cancel</router-link>
        <button @click="handleSave" :disabled="loading" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Saving...' : 'Update Authorizations' }}
        </button>
      </div>
    </div>
  </div>
</template>
