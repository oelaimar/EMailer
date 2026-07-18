<script setup>
import { ref, onMounted } from 'vue';
import { getRoles, affectRolesToUser } from '../../api/roles';
import { getUsers } from '../../api/users';

const roles = ref([]);
const users = ref([]);
const selectedUser = ref('');
const selectedRoles = ref([]);
const loading = ref(false);
const success = ref('');
const error = ref('');

onMounted(async () => {
  try {
    const [rolesRes, usersRes] = await Promise.all([
      getRoles({ limit: 100 }),
      getUsers({ limit: 100 }),
    ]);
    roles.value = rolesRes.data.data;
    users.value = usersRes.data.data;
  } catch (e) {
    error.value = 'Failed to load data.';
  }
});

const handleSubmit = async () => {
  if (!selectedUser.value || !selectedRoles.value.length) {
    error.value = 'Please select a user and at least one role.';
    return;
  }
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    await affectRolesToUser(selectedUser.value, selectedRoles.value);
    success.value = 'Roles affected to user successfully.';
    selectedRoles.value = [];
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to affect roles.';
  } finally {
    loading.value = false;
  }
};

const toggleRole = (id) => {
  const idx = selectedRoles.value.indexOf(id);
  if (idx > -1) selectedRoles.value.splice(idx, 1);
  else selectedRoles.value.push(id);
};

const allSelected = () => selectedRoles.value.length === roles.value.length;
const toggleAllRoles = () => {
  if (allSelected()) selectedRoles.value = [];
  else selectedRoles.value = roles.value.map((r) => r.id);
};
</script>

<template>
  <div class="max-w-3xl">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Affect Users To Roles</h1>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="success" class="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">{{ success }}</div>
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{{ error }}</div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Select User *</label>
        <select v-model="selectedUser" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Select a user...</option>
          <option v-for="user in users" :key="user.id" :value="user.id">{{ user.firstName }} {{ user.lastName }} ({{ user.email }})</option>
        </select>
      </div>

      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">Select Roles *</label>
          <button type="button" @click="toggleAllRoles" class="text-xs text-blue-600 hover:text-blue-800">
            {{ allSelected() ? 'Deselect All' : 'Select All' }}
          </button>
        </div>
        <select multiple :style="{ height: '310px' }" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option v-for="role in roles" :key="role.id" :value="role.id" :selected="selectedRoles.includes(role.id)" @click="toggleRole(role.id)">
            {{ role.name }}
          </option>
        </select>
      </div>

      <button @click="handleSubmit" :disabled="loading" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
        <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ loading ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </div>
</template>
