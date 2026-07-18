import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as apiLogin, logout as apiLogout, fetchMe } from '../api/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref((() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })());
  const accessToken = ref(localStorage.getItem('accessToken') || null);
  const refreshToken = ref(localStorage.getItem('refreshToken') || null);

  const isAuthenticated = computed(() => !!accessToken.value);
  const fullName = computed(() => user.value ? `${user.value.firstName} ${user.value.lastName}` : '');

  async function login(email, password) {
    const { data } = await apiLogin(email, password);
    user.value = data.user;
    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  }

  async function logout() {
    try {
      await apiLogout();
    } catch {}
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async function fetchUser() {
    try {
      const { data } = await fetchMe();
      user.value = data;
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      await logout();
    }
  }

  return { user, accessToken, refreshToken, isAuthenticated, fullName, login, logout, fetchUser };
});
