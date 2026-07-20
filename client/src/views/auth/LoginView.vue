<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.push('/dashboard');
  } catch (e) {
    error.value = e.response?.data?.error || 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="w-full max-w-md animate-[fadeInUp_0.5s_ease-out_forwards]">
    <div class="text-center mb-8">
      <div class="w-11 h-11 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-white tracking-tight">Vugex</h1>
      <p class="text-sidebar-text text-sm mt-1">Email infrastructure platform</p>
    </div>

    <div class="bg-surface border border-border rounded-2xl p-8 shadow-[0_25px_50px_-12px_oklch(0%_0_0/0.25)]">
      <h2 class="text-lg font-semibold text-fg tracking-tight mb-1">Welcome back</h2>
      <p class="text-sm text-muted mb-6">Sign in to your Vugex V2 account</p>

      <div class="flex gap-3 mb-6">
        <button type="button" class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-border rounded-lg bg-surface text-fg text-sm font-medium hover:bg-surface-alt transition-all">
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button type="button" class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-border rounded-lg bg-surface text-fg text-sm font-medium hover:bg-surface-alt transition-all">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </button>
      </div>

      <div class="flex items-center gap-3 mb-6">
        <div class="flex-1 h-px bg-border"></div>
        <span class="text-xs text-muted">or</span>
        <div class="flex-1 h-px bg-border"></div>
      </div>

      <form @submit.prevent="handleLogin">
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ error }}
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-fg mb-1">Email</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <input
              v-model="email"
              type="email"
              required
              class="w-full py-2.5 pl-10 pr-4 border border-border rounded-lg bg-surface text-fg text-sm focus:border-primary focus:shadow-[0_0_0_3px_oklch(55%_0.18_255/0.12)] outline-none transition-all"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-fg mb-1">Password</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <input
              v-model="password"
              type="password"
              required
              class="w-full py-2.5 pl-10 pr-4 border border-border rounded-lg bg-surface text-fg text-sm focus:border-primary focus:shadow-[0_0_0_3px_oklch(55%_0.18_255/0.12)] outline-none transition-all"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <div class="relative">
              <input type="checkbox" class="peer sr-only" />
              <div class="w-4 h-4 border border-border rounded bg-surface peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>
            <span class="text-sm text-muted">Remember me</span>
          </label>
          <a href="#" class="text-sm text-primary font-medium hover:text-primary-hover">Forgot password?</a>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_oklch(55%_0.18_255/0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>

    <p class="text-center text-sm text-muted mt-6">
      Don't have an account?
      <a href="#" class="text-primary font-medium hover:text-primary-hover">Start free trial</a>
    </p>

    <p class="text-center text-xs text-muted mt-4">
      By continuing, you agree to Vugex's
      <a href="#" class="text-primary hover:text-primary-hover">Terms of Service</a>
      and
      <a href="#" class="text-primary hover:text-primary-hover">Privacy Policy</a>
    </p>
  </div>
</template>

<style>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
