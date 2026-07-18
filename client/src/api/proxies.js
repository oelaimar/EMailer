import client from './client';

export const getProxies = (params) => client.get('/proxies', { params });
export const getProxy = (id) => client.get(`/proxies/${id}`);
export const createProxy = (data) => client.post('/proxies', data);
export const updateProxy = (id, data) => client.put(`/proxies/${id}`, data);
export const deleteProxy = (id) => client.delete(`/proxies/${id}`);
export const bulkActionProxies = (action, ids) => client.post('/proxies/bulk-action', { action, ids });
export const getProxiesByType = (type) => client.get(`/proxies/by-type/${type}`);
