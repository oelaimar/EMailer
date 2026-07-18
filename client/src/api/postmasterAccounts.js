import client from './client';

export const getPostmasterAccounts = (params) => client.get('/postmaster-accounts', { params });
export const getPostmasterAccount = (id) => client.get(`/postmaster-accounts/${id}`);
export const createPostmasterAccount = (data) => client.post('/postmaster-accounts', data);
export const updatePostmasterAccount = (id, data) => client.put(`/postmaster-accounts/${id}`, data);
export const deletePostmasterAccount = (id) => client.delete(`/postmaster-accounts/${id}`);
export const bulkActionPostmasterAccounts = (action, ids) => client.post('/postmaster-accounts/bulk-action', { action, ids });
