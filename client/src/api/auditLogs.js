import client from './client';

export const getAuditLogs = (params) => client.get('/audit-logs', { params });
export const getAuditLog = (id) => client.get(`/audit-logs/${id}`);
export const createAuditLog = (data) => client.post('/audit-logs', data);
export const deleteAuditLog = (id) => client.delete(`/audit-logs/${id}`);
export const bulkActionAuditLogs = (action, ids) => client.post('/audit-logs/bulk-action', { action, ids });
