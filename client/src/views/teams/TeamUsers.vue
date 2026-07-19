<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTeam, getTeamUsers, setTeamUsers } from '../../api/teams';
import { getUsers } from '../../api/users';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const teamName = ref('');

const affected = ref([]);
const unaffected = ref([]);
const selectedAffected = ref([]);
const selectedUnaffected = ref([]);

onMounted(async () => {
  try {
    const { data: team } = await getTeam(route.params.id);
    teamName.value = team.name;

    const [teamUsersRes, allUsersRes] = await Promise.all([
      getTeamUsers(route.params.id),
      getUsers({ limit: 1000 }),
    ]);

    const teamUserIds = teamUsersRes.data.map((u) => u.id);
    affected.value = teamUsersRes.data;
    unaffected.value = allUsersRes.data.data.filter((u) => !teamUserIds.includes(u.id));
  } catch (e) {
    error.value = 'Failed to load data.';
  }
});

const moveToAffected = () => {
  const toMove = unaffected.value.filter((_, i) => selectedUnaffected.value.includes(i));
  affected.value.push(...toMove);
  unaffected.value = unaffected.value.filter((_, i) => !selectedUnaffected.value.includes(i));
  selectedUnaffected.value = [];
};

const moveToUnaffected = () => {
  const toMove = affected.value.filter((_, i) => selectedAffected.value.includes(i));
  unaffected.value.push(...toMove);
  affected.value = affected.value.filter((_, i) => !selectedAffected.value.includes(i));
  selectedAffected.value = [];
};

const handleSave = async () => {
  loading.value = true;
  error.value = '';
  try {
    await setTeamUsers(route.params.id, affected.value.map((u) => u.id));
    router.push('/teams');
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Manage Users - {{ teamName }}</h1>
      <router-link to="/teams" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Not Affected Users</h3>
          <select v-model="selectedUnaffected" multiple class="w-full h-64 border border-gray-300 rounded-lg text-sm p-2">
            <option v-for="(user, index) in unaffected" :key="user.id" :value="index">
              {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
            </option>
          </select>
        </div>

        <div class="flex flex-col items-center justify-center gap-2">
          <button @click="moveToAffected" type="button" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            Add &rarr;
          </button>
          <button @click="moveToUnaffected" type="button" class="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
            &larr; Remove
          </button>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Affected Users ({{ affected.length }})</h3>
          <select v-model="selectedAffected" multiple class="w-full h-64 border border-gray-300 rounded-lg text-sm p-2">
            <option v-for="(user, index) in affected" :key="user.id" :value="index">
              {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
            </option>
          </select>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button @click="handleSave" :disabled="loading" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
