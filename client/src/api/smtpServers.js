import client from './client';

export const getSmtpServers = (params) => client.get('/smtp-servers', { params });
export const getSmtpServer = (id) => client.get(`/smtp-servers/${id}`);
export const createSmtpServer = (data) => client.post('/smtp-servers', data);
export const updateSmtpServer = (id, data) => client.put(`/smtp-servers/${id}`, data);
export const deleteSmtpServer = (id) => client.delete(`/smtp-servers/${id}`);
export const checkSmtpServer = (id) => client.post(`/smtp-servers/${id}/check`);
export const bulkCheckSmtpServers = (ids) => client.post('/smtp-servers/bulk-check', { ids });
export const bulkActionSmtpServers = (action, ids) => client.post('/smtp-servers/bulk-action', { action, ids });
