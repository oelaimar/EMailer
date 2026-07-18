import client from './client';

export const getIsps = (params) => client.get('/isps', { params });
export const getIsp = (id) => client.get(`/isps/${id}`);
export const createIsp = (data) => client.post('/isps', data);
export const updateIsp = (id, data) => client.put(`/isps/${id}`, data);
export const deleteIsp = (id) => client.delete(`/isps/${id}`);
export const bulkActionIsps = (action, ids) => client.post('/isps/bulk-action', { action, ids });
export const bulkAddIsps = (names) => client.post('/isps/bulk-add', { names });
