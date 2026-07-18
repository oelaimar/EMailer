import client from './client';

export const getOutlookAccounts = (params) => client.get('/outlook-accounts', { params });
export const getOutlookAccount = (id) => client.get(`/outlook-accounts/${id}`);
export const createOutlookAccount = (data) => client.post('/outlook-accounts', data);
export const updateOutlookAccount = (id, data) => client.put(`/outlook-accounts/${id}`, data);
export const deleteOutlookAccount = (id) => client.delete(`/outlook-accounts/${id}`);
export const bulkActionOutlookAccounts = (action, ids) => client.post('/outlook-accounts/bulk-action', { action, ids });
