import client from './client';

export const getCloudInstances = (params) => client.get('/cloud-instances', { params });
export const getCloudInstance = (id) => client.get(`/cloud-instances/${id}`);
export const createCloudInstance = (data) => client.post('/cloud-instances', data);
export const updateCloudInstance = (id, data) => client.put(`/cloud-instances/${id}`, data);
export const deleteCloudInstance = (id) => client.delete(`/cloud-instances/${id}`);
export const bulkActionCloudInstances = (action, ids) => client.post('/cloud-instances/bulk-action', { action, ids });
