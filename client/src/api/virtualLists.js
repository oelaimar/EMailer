import client from './client';

export const getVirtualLists = (params) => client.get('/virtual-lists', { params });
export const getVirtualList = (id) => client.get(`/virtual-lists/${id}`);
export const createVirtualList = (data) => client.post('/virtual-lists', data);
export const updateVirtualList = (id, data) => client.put(`/virtual-lists/${id}`, data);
export const deleteVirtualList = (id) => client.delete(`/virtual-lists/${id}`);
export const bulkActionVirtualLists = (action, ids) => client.post('/virtual-lists/bulk-action', { action, ids });
