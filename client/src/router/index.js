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
      { path: 'offers', name: 'OffersList', component: () => import('../views/offers/OffersList.vue') },
      { path: 'offers/add', name: 'OfferAdd', component: () => import('../views/offers/OfferForm.vue') },
      { path: 'offers/:id/edit', name: 'OfferEdit', component: () => import('../views/offers/OfferForm.vue') },
      { path: 'offers/:id/suppression', name: 'OfferSuppression', component: () => import('../views/offers/SuppressionView.vue') },
      { path: 'affiliate-networks', name: 'AffiliateNetworksList', component: () => import('../views/affiliate-networks/AffiliateNetworksList.vue') },
      { path: 'affiliate-networks/add', name: 'AffiliateNetworkAdd', component: () => import('../views/affiliate-networks/AffiliateNetworkForm.vue') },
      { path: 'affiliate-networks/:id/edit', name: 'AffiliateNetworkEdit', component: () => import('../views/affiliate-networks/AffiliateNetworkForm.vue') },
      { path: 'auto-responders', name: 'AutoRespondersList', component: () => import('../views/auto-responders/AutoRespondersList.vue') },
      { path: 'auto-responders/add', name: 'AutoResponderAdd', component: () => import('../views/auto-responders/AutoResponderForm.vue') },
      { path: 'auto-responders/:id/edit', name: 'AutoResponderEdit', component: () => import('../views/auto-responders/AutoResponderForm.vue') },
      { path: 'virtual-lists', name: 'VirtualListsList', component: () => import('../views/virtual-lists/VirtualListsList.vue') },
      { path: 'virtual-lists/add', name: 'VirtualListAdd', component: () => import('../views/virtual-lists/VirtualListForm.vue') },
      { path: 'virtual-lists/:id/edit', name: 'VirtualListEdit', component: () => import('../views/virtual-lists/VirtualListForm.vue') },
      { path: 'production', name: 'ProductionList', component: () => import('../views/production/ProductionList.vue') },
      { path: 'production/add', name: 'ProductionAdd', component: () => import('../views/production/ProductionForm.vue') },
      { path: 'production/:id/edit', name: 'ProductionEdit', component: () => import('../views/production/ProductionForm.vue') },
      { path: 'production/:id/processes', name: 'SendProcesses', component: () => import('../views/production/SendProcessesView.vue') },
      { path: 'gmail-accounts', name: 'GmailAccountsList', component: () => import('../views/gmail/GmailAccountsList.vue') },
      { path: 'gmail-accounts/add', name: 'GmailAccountAdd', component: () => import('../views/gmail/GmailAccountForm.vue') },
      { path: 'gmail-accounts/:id/edit', name: 'GmailAccountEdit', component: () => import('../views/gmail/GmailAccountForm.vue') },
      { path: 'gsuite-accounts', name: 'GsuiteAccountsList', component: () => import('../views/gsuite/GSuiteAccountsList.vue') },
      { path: 'gsuite-accounts/add', name: 'GsuiteAccountAdd', component: () => import('../views/gsuite/GSuiteAccountForm.vue') },
      { path: 'gsuite-accounts/:id/edit', name: 'GsuiteAccountEdit', component: () => import('../views/gsuite/GSuiteAccountForm.vue') },
      { path: 'outlook-accounts', name: 'OutlookAccountsList', component: () => import('../views/outlook/OutlookAccountsList.vue') },
      { path: 'outlook-accounts/add', name: 'OutlookAccountAdd', component: () => import('../views/outlook/OutlookAccountForm.vue') },
      { path: 'outlook-accounts/:id/edit', name: 'OutlookAccountEdit', component: () => import('../views/outlook/OutlookAccountForm.vue') },
      { path: 'cloud-accounts', name: 'CloudAccountsList', component: () => import('../views/cloud-accounts/CloudAccountsList.vue') },
      { path: 'cloud-accounts/add', name: 'CloudAccountAdd', component: () => import('../views/cloud-accounts/CloudAccountForm.vue') },
      { path: 'cloud-accounts/:id/edit', name: 'CloudAccountEdit', component: () => import('../views/cloud-accounts/CloudAccountForm.vue') },
      { path: 'cloud-instances', name: 'CloudInstancesList', component: () => import('../views/cloud-instances/CloudInstancesList.vue') },
      { path: 'cloud-instances/add', name: 'CloudInstanceAdd', component: () => import('../views/cloud-instances/CloudInstanceForm.vue') },
      { path: 'registrar-accounts', name: 'RegistrarAccountsList', component: () => import('../views/registrar-accounts/RegistrarAccountsList.vue') },
      { path: 'registrar-accounts/add', name: 'RegistrarAccountAdd', component: () => import('../views/registrar-accounts/RegistrarAccountForm.vue') },
      { path: 'registrar-accounts/:id/edit', name: 'RegistrarAccountEdit', component: () => import('../views/registrar-accounts/RegistrarAccountForm.vue') },
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
