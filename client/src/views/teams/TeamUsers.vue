<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTeam, getTeamUsers, setTeamUsers } from '../../api/teams';
import { getUsers } from '../../api/users';
import PageHeader from '../../components/common/PageHeader.vue';

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
      <PageHeader :title="`Manage Users - ${teamName}`" />
      <router-link to="/teams" class="px-4 py-2 border border-border bg-surface text-fg hover:bg-surface-alt text-sm font-medium rounded-lg transition-colors">
        Back to List
      </router-link>
    </div>

    <div class="bg-surface rounded-xl border border-border p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 class="text-sm font-medium text-fg-secondary mb-2">Not Affected Users</h3>
          <select v-model="selectedUnaffected" multiple class="w-full h-64 border border-border rounded-lg text-sm p-2">
            <option v-for="(user, index) in unaffected" :key="user.id" :value="index">
              {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
            </option>
          </select>
        </div>

        <div class="flex flex-col items-center justify-center gap-2">
          <button @click="moveToAffected" type="button" class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors">
            Add &rarr;
          </button>
          <button @click="moveToUnaffected" type="button" class="px-4 py-2 border border-border bg-surface text-fg text-sm rounded-lg hover:bg-surface-alt transition-colors">
            &larr; Remove
          </button>
        </div>

        <div>
          <h3 class="text-sm font-medium text-fg-secondary mb-2">Affected Users ({{ affected.length }})</h3>
          <select v-model="selectedAffected" multiple class="w-full h-64 border border-border rounded-lg text-sm p-2">
            <option v-for="(user, index) in affected" :key="user.id" :value="index">
              {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
            </option>
          </select>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button @click="handleSave" :disabled="loading" class="px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
