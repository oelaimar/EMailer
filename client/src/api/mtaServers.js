import client from './client';

export const getMtaServers = (params) => client.get('/mta-servers', { params });
export const getMtaServer = (id) => client.get(`/mta-servers/${id}`);
export const createMtaServer = (data) => client.post('/mta-servers', data);
export const updateMtaServer = (id, data) => client.put(`/mta-servers/${id}`, data);
export const deleteMtaServer = (id) => client.delete(`/mta-servers/${id}`);
export const checkMtaServer = (id) => client.post(`/mta-servers/${id}/check`);
export const bulkCheckMtaServers = (ids) => client.post('/mta-servers/bulk-check', { ids });
export const bulkActionMtaServers = (action, ids) => client.post('/mta-servers/bulk-action', { action, ids });
export const installMtaServer = (id) => client.post(`/mta-servers/${id}/install`);
export const getInstallLogs = (id) => client.get(`/mta-servers/${id}/install-logs`);
export const configureMtaIps = (id) => client.post(`/mta-servers/${id}/configure-ips`);
export const extractRdns = (id) => client.post(`/mta-servers/${id}/extract-rdns`);
export const generateDkim = (id) => client.post(`/mta-servers/${id}/generate-dkim`);
export const bulkInstallMta = (ids) => client.post('/mta-servers/bulk-install', { ids });
export const getBulkInstallLogs = (ids) => client.post('/mta-servers/bulk-install-logs', { ids });
