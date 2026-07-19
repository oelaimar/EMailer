import client from './client';

export const getBackendLogs = (params) => client.get('/logs/backend', { params });
export const getFrontendLogs = (params) => client.get('/logs/frontend', { params });
export const createFrontendLog = (data) => client.post('/logs/frontend', data);
export const clearFrontendLogs = () => client.delete('/logs/frontend');
