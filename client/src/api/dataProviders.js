import client from './client';

export const getDataProviders = (params) => client.get('/data-providers', { params });
export const getDataProvider = (id) => client.get(`/data-providers/${id}`);
export const createDataProvider = (data) => client.post('/data-providers', data);
export const updateDataProvider = (id, data) => client.put(`/data-providers/${id}`, data);
export const deleteDataProvider = (id) => client.delete(`/data-providers/${id}`);
export const bulkActionDataProviders = (action, ids) => client.post('/data-providers/bulk-action', { action, ids });
export const bulkAddDataProviders = (names) => client.post('/data-providers/bulk-add', { names });
