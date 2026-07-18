import client from './client';

export const getRegistrarAccounts = (params) => client.get('/registrar-accounts', { params });
export const getRegistrarAccount = (id) => client.get(`/registrar-accounts/${id}`);
export const createRegistrarAccount = (data) => client.post('/registrar-accounts', data);
export const updateRegistrarAccount = (id, data) => client.put(`/registrar-accounts/${id}`, data);
export const deleteRegistrarAccount = (id) => client.delete(`/registrar-accounts/${id}`);
export const bulkActionRegistrarAccounts = (action, ids) => client.post('/registrar-accounts/bulk-action', { action, ids });
export const getRegistrarAccountsByRegistrar = (registrar) => client.get(`/registrar-accounts/by-registrar/${registrar}`);
