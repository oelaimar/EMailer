import client from './client';

export const getDataLists = (params) => client.get('/data-lists', { params });
export const getDataList = (id) => client.get(`/data-lists/${id}`);
export const createDataList = (data) => client.post('/data-lists', data);
export const updateDataList = (id, data) => client.put(`/data-lists/${id}`, data);
export const deleteDataList = (id) => client.delete(`/data-lists/${id}`);
export const uploadDataList = (data) => client.post('/data-lists/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const bulkActionDataLists = (action, ids) => client.post('/data-lists/bulk-action', { action, ids });
