import client from './client';

export const getProductions = (params) => client.get('/production', { params });
export const getProduction = (id) => client.get(`/production/${id}`);
export const createProduction = (data) => client.post('/production', data);
export const updateProduction = (id, data) => client.put(`/production/${id}`, data);
export const deleteProduction = (id) => client.delete(`/production/${id}`);
export const getSendProcesses = (productionId, params) => client.get(`/production/${productionId}/processes`, { params });
export const createSendProcess = (productionId, data) => client.post(`/production/${productionId}/processes`, data);
export const updateSendProcess = (productionId, processId, data) => client.put(`/production/${productionId}/processes/${processId}`, data);
export const deleteSendProcess = (productionId, processId) => client.delete(`/production/${productionId}/processes/${processId}`);
export const getMtaDrops = (params) => client.get('/production/mta-drops', { params });
export const getMtaTests = (params) => client.get('/production/mta-tests', { params });
export const getSmtpDrops = (params) => client.get('/production/smtp-drops', { params });
export const getSmtpTests = (params) => client.get('/production/smtp-tests', { params });
export const uploadProductionImages = (id, data) => client.post(`/production/${id}/upload-images`, data);
export const executeProcessAction = (id, action) => client.post(`/production/processes/${id}/action`, { action });
