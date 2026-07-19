import client from './client';

export const getGeoManagerProcesses = (params) => client.get('/geo-manager', { params });
export const getGeoManagerProcess = (id) => client.get(`/geo-manager/${id}`);
export const createGeoManagerProcess = (data) => client.post('/geo-manager', data);
export const startGeoManagerProcess = (id) => client.put(`/geo-manager/${id}/start`);
export const stopGeoManagerProcess = (id) => client.put(`/geo-manager/${id}/stop`);
export const deleteGeoManagerProcess = (id) => client.delete(`/geo-manager/${id}`);
export const getGeoManagerLogs = (id) => client.get(`/geo-manager/${id}/logs`);
export const bulkActionGeoManager = (action, ids) => client.post('/geo-manager/bulk-action', { action, ids });
