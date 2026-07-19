<script setup>
import { ref, computed, onMounted } from 'vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import {
  getPostmasterSources,
  getPostmasterMessages,
  refreshPostmasterMailbox,
  getPostmasterMessageDetail,
  deletePostmasterMessages,
  exportPostmasterReplyAccounts,
} from '../../api/postmaster';

const sources = ref([]);
const messages = ref([]);
const summary = ref({ messageCount: 0, uniqueSenders: 0, blacklistedCount: 0, lastRefreshAt: null });
const loading = ref(false);
const refreshing = ref(false);

const selectedProvider = ref('');
const selectedServer = ref('');
const selectedAccountId = ref('');
const messageLimit = ref(100);
const searchText = ref('');
const dateFrom = ref('');
const dateTo = ref('');

const providers = computed(() => [...new Set(sources.value.map(s => s.providerName).filter(Boolean))].sort());
const servers = computed(() => {
  let filtered = sources.value;
  if (selectedProvider.value) filtered = filtered.filter(s => s.providerName === selectedProvider.value);
  return [...new Set(filtered.map(s => s.serverName).filter(Boolean))].sort();
});
const filteredDomains = computed(() => {
  let filtered = sources.value;
  if (selectedProvider.value) filtered = filtered.filter(s => s.providerName === selectedProvider.value);
  if (selectedServer.value) filtered = filtered.filter(s => s.serverName === selectedServer.value);
  return filtered;
});

const showModal = ref(false);
const detailMessage = ref(null);
const detailTab = ref('body');
const detailLoading = ref(false);

const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);
const deleteBlacklist = ref(false);

const showExportModal = ref(false);
const exportPassword = ref('');

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString();
};

const loadSources = async () => {
  try {
    const { data } = await getPostmasterSources();
    sources.value = data.data || [];
  } catch (e) {
    console.error('Failed to load sources:', e);
  }
};

const loadMessages = async () => {
  if (!selectedAccountId.value) return;
  loading.value = true;
  try {
    const { data } = await getPostmasterMessages({
      accountId: parseInt(selectedAccountId.value, 10),
      search: searchText.value || undefined,
      dateFrom: dateFrom.value || undefined,
      dateTo: dateTo.value || undefined,
      limit: messageLimit.value,
    });
    messages.value = data.data || [];
    summary.value = data.summary || {};
  } catch (e) {
    console.error('Failed to load messages:', e);
  } finally {
    loading.value = false;
  }
};

const refreshMailbox = async () => {
  if (!selectedAccountId.value) return;
  refreshing.value = true;
  try {
    const { data } = await refreshPostmasterMailbox({
      accountId: parseInt(selectedAccountId.value, 10),
    });
    messages.value = data.data || [];
    summary.value = data.summary || {};
  } catch (e) {
    console.error('Refresh failed:', e);
    alert(e.response?.data?.error || 'Refresh failed');
  } finally {
    refreshing.value = false;
  }
};

const clearFilters = () => {
  searchText.value = '';
  dateFrom.value = '';
  dateTo.value = '';
  messageLimit.value = 100;
  loadMessages();
};

const openDetail = async (msg, tab) => {
  detailTab.value = tab;
  detailMessage.value = { subject: msg.subject, from: msg.from, date: msg.date };
  showModal.value = true;
  detailLoading.value = true;
  try {
    const { data } = await getPostmasterMessageDetail(msg.id);
    detailMessage.value = data.data;
  } catch (e) {
    console.error('Failed to load message:', e);
  } finally {
    detailLoading.value = false;
  }
};

const confirmDelete = (msg, blacklist) => {
  deleteTarget.value = msg;
  deleteBlacklist.value = blacklist;
  showDeleteConfirm.value = true;
};

const executeDelete = async () => {
  if (!deleteTarget.value) return;
  try {
    await deletePostmasterMessages({
      messageIds: [deleteTarget.value.id],
      blacklist: deleteBlacklist.value,
    });
    messages.value = messages.value.filter(m => m.id !== deleteTarget.value.id);
    summary.value.messageCount = Math.max(0, (summary.value.messageCount || 0) - 1);
  } catch (e) {
    console.error('Delete failed:', e);
  } finally {
    showDeleteConfirm.value = false;
    deleteTarget.value = null;
  }
};

const openExport = () => {
  if (!selectedAccountId.value) return;
  exportPassword.value = '';
  showExportModal.value = true;
};

const executeExport = async () => {
  if (!selectedAccountId.value) return;
  try {
    const { data } = await exportPostmasterReplyAccounts({
      accountId: parseInt(selectedAccountId.value, 10),
      password: exportPassword.value,
    });
    const { contentBase64, fileName } = data.data;
    const csv = atob(contentBase64);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    showExportModal.value = false;
  } catch (e) {
    console.error('Export failed:', e);
    alert(e.response?.data?.error || 'Export failed');
  }
};

const truncate = (str, len = 60) => {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
};

onMounted(() => {
  loadSources();
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Postmaster Inbox Monitor</h1>
      <div class="flex gap-2">
        <router-link to="/postmaster-accounts" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Accounts</router-link>
        <router-link to="/postmaster/runs" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Runs</router-link>
      </div>
    </div>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
      <p><strong>How it works:</strong> Select a domain and click "Refresh Mailbox" to fetch the latest postmaster messages via IMAP.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Provider</label>
        <select v-model="selectedProvider" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All providers</option>
          <option v-for="p in providers" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Server</label>
        <select v-model="selectedServer" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All servers</option>
          <option v-for="s in servers" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Domain</label>
        <select v-model="selectedAccountId" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Select a domain...</option>
          <option v-for="d in filteredDomains" :key="d.id" :value="d.id">
            {{ d.domain }} | {{ d.serverName || '-' }} | {{ d.providerName || '-' }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Limit</label>
        <select v-model="messageLimit" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
          <option :value="250">250</option>
          <option :value="1000">All</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <input v-model="searchText" type="text" placeholder="Search by sender, subject, or message id..." class="md:col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <input v-model="dateFrom" type="date" placeholder="YYYY-MM-DD" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <input v-model="dateTo" type="date" placeholder="YYYY-MM-DD" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
    </div>

    <div class="flex gap-2 mb-6">
      <button @click="loadMessages" :disabled="!selectedAccountId || loading" class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
        {{ loading ? 'Loading...' : 'Apply Filters' }}
      </button>
      <button @click="clearFilters" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Clear</button>
      <button @click="refreshMailbox" :disabled="!selectedAccountId || refreshing" class="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
        {{ refreshing ? 'Refreshing...' : 'Refresh Mailbox' }}
      </button>
      <button @click="openExport" :disabled="!selectedAccountId" class="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
        Export CSV
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ summary.messageCount || 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Total Messages</p>
      </div>
      <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ summary.uniqueSenders || 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Unique Senders</p>
      </div>
      <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ summary.blacklistedCount || 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Blacklisted Senders</p>
      </div>
      <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
        <p class="text-sm font-bold text-purple-600">{{ formatDate(summary.lastRefreshAt) }}</p>
        <p class="text-xs text-gray-500 mt-1">Last Refresh</p>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-600 w-[14%]">Date</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600 w-[24%]">From</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600">Subject</th>
            <th class="px-4 py-3 text-left font-medium text-gray-600 w-[10%]">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="messages.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-gray-400">
              {{ selectedAccountId ? 'No messages found' : 'Select a domain to view messages' }}
            </td>
          </tr>
          <tr v-for="msg in messages" :key="msg.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-600">{{ formatDate(msg.date) }}</td>
            <td class="px-4 py-3 text-gray-800 font-medium">{{ msg.from }}</td>
            <td class="px-4 py-3 text-gray-600 truncate max-w-xs" :title="msg.subject">{{ truncate(msg.subject, 80) }}</td>
            <td class="px-4 py-3">
              <div class="flex gap-1">
                <button @click="openDetail(msg, 'body')" class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200" title="View Body">Body</button>
                <button @click="openDetail(msg, 'headers')" class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200" title="View Headers">Headers</button>
                <button @click="openDetail(msg, 'raw')" class="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200" title="View Raw">Raw</button>
                <button @click="confirmDelete(msg, false)" class="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200" title="Delete">Del</button>
                <button @click="confirmDelete(msg, true)" class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200" title="Delete + Blacklist">Ban</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showModal = false">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 truncate">{{ detailMessage?.subject || 'Message Details' }}</h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="flex border-b border-gray-200 px-6">
            <button @click="detailTab = 'body'" :class="['px-4 py-2 text-sm font-medium border-b-2 -mb-px', detailTab === 'body' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']">Body</button>
            <button @click="detailTab = 'headers'" :class="['px-4 py-2 text-sm font-medium border-b-2 -mb-px', detailTab === 'headers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']">Headers</button>
            <button @click="detailTab = 'raw'" :class="['px-4 py-2 text-sm font-medium border-b-2 -mb-px', detailTab === 'raw' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']">Raw Source</button>
          </div>
          <div class="flex-1 overflow-auto p-6">
            <div v-if="detailLoading" class="flex items-center justify-center py-12 text-gray-400">Loading...</div>
            <div v-else>
              <div v-if="detailTab === 'body'" class="prose prose-sm max-w-none" style="max-height: 60vh; overflow: auto;">
                <div v-if="detailMessage?.bodyHtml" v-html="detailMessage.bodyHtml"></div>
                <pre v-else class="whitespace-pre-wrap text-sm text-gray-700">{{ detailMessage?.bodyText || 'No body content' }}</pre>
              </div>
              <pre v-if="detailTab === 'headers'" class="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded" style="max-height: 60vh; overflow: auto;">{{ detailMessage?.rawHeaders || 'No headers' }}</pre>
              <pre v-if="detailTab === 'raw'" class="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded" style="max-height: 60vh; overflow: auto;">{{ detailMessage?.rawHeaders || 'No raw source' }}</pre>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showExportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showExportModal = false">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Export Reply Accounts</h3>
          <p class="text-sm text-gray-600 mb-4">Enter the Postmaster export password.</p>
          <input v-model="exportPassword" type="password" placeholder="Export Password" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4" />
          <div class="flex justify-end gap-3">
            <button @click="showExportModal = false" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button @click="executeExport" class="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Export</button>
          </div>
        </div>
      </div>
    </Teleport>

    <ConfirmDialog
      :show="showDeleteConfirm"
      :title="deleteBlacklist ? 'Delete + Blacklist' : 'Delete Message'"
      :message="deleteBlacklist ? 'Delete this message and blacklist the sender?' : 'Delete this message from the cache?'"
      :confirmText="deleteBlacklist ? 'Delete + Blacklist' : 'Delete'"
      @confirm="executeDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
