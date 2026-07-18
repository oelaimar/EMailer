import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'Login', component: () => import('../views/auth/LoginView.vue'), meta: { guest: true } },
    ],
  },
  {
    path: '/',
    component: () => import('../layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/dashboard/DashboardView.vue') },
      { path: 'smtp-servers', name: 'SmtpServersList', component: () => import('../views/smtp-servers/SmtpServersList.vue') },
      { path: 'smtp-servers/add', name: 'SmtpServerAdd', component: () => import('../views/smtp-servers/SmtpServerForm.vue') },
      { path: 'smtp-servers/:id/edit', name: 'SmtpServerEdit', component: () => import('../views/smtp-servers/SmtpServerForm.vue') },
      { path: 'smtp-servers/bulk-check', name: 'SmtpBulkCheck', component: () => import('../views/smtp-servers/SmtpBulkCheck.vue') },
      { path: 'mta-servers', name: 'MtaServersList', component: () => import('../views/mta-servers/MtaServersList.vue') },
      { path: 'mta-servers/add', name: 'MtaServerAdd', component: () => import('../views/mta-servers/MtaServerForm.vue') },
      { path: 'mta-servers/:id/edit', name: 'MtaServerEdit', component: () => import('../views/mta-servers/MtaServerForm.vue') },
      { path: 'domains', name: 'DomainsList', component: () => import('../views/domains/DomainsList.vue') },
      { path: 'domains/add', name: 'DomainAdd', component: () => import('../views/domains/DomainForm.vue') },
      { path: 'domains/:id/edit', name: 'DomainEdit', component: () => import('../views/domains/DomainForm.vue') },
      { path: 'data-lists', name: 'DataListsList', component: () => import('../views/data-lists/DataListsList.vue') },
      { path: 'data-lists/add', name: 'DataListAdd', component: () => import('../views/data-lists/DataListForm.vue') },
      { path: 'data-lists/:id/edit', name: 'DataListEdit', component: () => import('../views/data-lists/DataListForm.vue') },
      { path: 'smtp-groups', name: 'SmtpGroupsList', component: () => import('../views/smtp-groups/SmtpGroupsList.vue') },
      { path: 'smtp-groups/add', name: 'SmtpGroupAdd', component: () => import('../views/smtp-groups/SmtpGroupForm.vue') },
      { path: 'smtp-groups/:id/edit', name: 'SmtpGroupEdit', component: () => import('../views/smtp-groups/SmtpGroupForm.vue') },
      { path: 'users', name: 'UsersList', component: () => import('../views/users/UsersList.vue') },
      { path: 'users/add', name: 'UserAdd', component: () => import('../views/users/UserForm.vue') },
      { path: 'users/:id/edit', name: 'UserEdit', component: () => import('../views/users/UserForm.vue') },
      { path: 'roles', name: 'RolesList', component: () => import('../views/roles/RolesList.vue') },
      { path: 'roles/add', name: 'RoleAdd', component: () => import('../views/roles/RoleForm.vue') },
      { path: 'roles/:id/edit', name: 'RoleEdit', component: () => import('../views/roles/RoleForm.vue') },
      { path: 'roles/affect', name: 'RoleAffect', component: () => import('../views/roles/RoleAffect.vue') },
      { path: 'roles/users', name: 'RoleUsers', component: () => import('../views/roles/RoleUsers.vue') },
      { path: 'sessions', name: 'Sessions', component: () => import('../views/sessions/SessionsView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
