import client from './client';

export const getServerProviders = (params) => client.get('/server-providers', { params });
export const getServerProvider = (id) => client.get(`/server-providers/${id}`);
export const createServerProvider = (data) => client.post('/server-providers', data);
export const updateServerProvider = (id, data) => client.put(`/server-providers/${id}`, data);
export const deleteServerProvider = (id) => client.delete(`/server-providers/${id}`);
export const bulkActionServerProviders = (action, ids) => client.post('/server-providers/bulk-action', { action, ids });
export const bulkAddServerProviders = (names) => client.post('/server-providers/bulk-add', { names });
