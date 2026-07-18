import client from './client';

export const getGmailAccounts = (params) => client.get('/gmail-accounts', { params });
export const getGmailAccount = (id) => client.get(`/gmail-accounts/${id}`);
export const createGmailAccount = (data) => client.post('/gmail-accounts', data);
export const updateGmailAccount = (id, data) => client.put(`/gmail-accounts/${id}`, data);
export const deleteGmailAccount = (id) => client.delete(`/gmail-accounts/${id}`);
export const bulkActionGmailAccounts = (action, ids) => client.post('/gmail-accounts/bulk-action', { action, ids });
