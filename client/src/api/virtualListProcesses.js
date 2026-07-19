import client from './client';

export const getVirtualListProcesses = (params) => client.get('/virtual-list-processes', { params });
export const getVirtualListProcess = (id) => client.get(`/virtual-list-processes/${id}`);
export const createVirtualListProcess = (data) => client.post('/virtual-list-processes', data);
export const startVirtualListProcess = (id) => client.post(`/virtual-list-processes/${id}/start`);
export const stopVirtualListProcess = (id) => client.post(`/virtual-list-processes/${id}/stop`);
export const deleteVirtualListProcess = (id) => client.delete(`/virtual-list-processes/${id}`);
export const bulkActionVirtualListProcesses = (action, ids) => client.post('/virtual-list-processes/bulk-action', { action, ids });
