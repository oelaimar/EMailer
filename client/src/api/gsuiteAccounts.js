import client from './client';

export const getGsuiteAccounts = (params) => client.get('/gsuite-accounts', { params });
export const getGsuiteAccount = (id) => client.get(`/gsuite-accounts/${id}`);
export const createGsuiteAccount = (data) => client.post('/gsuite-accounts', data);
export const updateGsuiteAccount = (id, data) => client.put(`/gsuite-accounts/${id}`, data);
export const deleteGsuiteAccount = (id) => client.delete(`/gsuite-accounts/${id}`);
export const bulkActionGsuiteAccounts = (action, ids) => client.post('/gsuite-accounts/bulk-action', { action, ids });
