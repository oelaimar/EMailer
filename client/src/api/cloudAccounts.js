import client from './client';

export const getCloudAccounts = (params) => client.get('/cloud-accounts', { params });
export const getCloudAccount = (id) => client.get(`/cloud-accounts/${id}`);
export const createCloudAccount = (data) => client.post('/cloud-accounts', data);
export const updateCloudAccount = (id, data) => client.put(`/cloud-accounts/${id}`, data);
export const deleteCloudAccount = (id) => client.delete(`/cloud-accounts/${id}`);
export const bulkActionCloudAccounts = (action, ids) => client.post('/cloud-accounts/bulk-action', { action, ids });
export const getCloudAccountsByProvider = (provider) => client.get(`/cloud-accounts/by-provider/${provider}`);
