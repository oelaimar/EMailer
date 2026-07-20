import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as apiLogin, logout as apiLogout, fetchMe } from '../api/auth';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  const user = ref((() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })());
  const accessToken = ref(localStorage.getItem('accessToken') || null);
  const refreshToken = ref(localStorage.getItem('refreshToken') || null);
  let isLoggingOut = false;

  const isAuthenticated = computed(() => {
    if (!accessToken.value) return false;
    try {
      const payload = JSON.parse(atob(accessToken.value.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  });

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
    if (isLoggingOut) return;
    isLoggingOut = true;
    const currentRefreshToken = refreshToken.value;
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (currentRefreshToken) {
      try {
        await axios.post('/api/auth/logout', { refreshToken: currentRefreshToken });
      } catch {}
    }
    isLoggingOut = false;
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
