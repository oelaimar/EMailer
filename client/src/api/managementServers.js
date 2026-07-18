import client from './client';

export const getManagementServers = (params) => client.get('/management-servers', { params });
export const getManagementServer = (id) => client.get(`/management-servers/${id}`);
export const createManagementServer = (data) => client.post('/management-servers', data);
export const updateManagementServer = (id, data) => client.put(`/management-servers/${id}`, data);
export const deleteManagementServer = (id) => client.delete(`/management-servers/${id}`);
export const bulkActionManagementServers = (action, ids) => client.post('/management-servers/bulk-action', { action, ids });
