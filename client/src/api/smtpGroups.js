import client from './client';

export const getSmtpGroups = (params) => client.get('/smtp-groups', { params });
export const getSmtpGroup = (id) => client.get(`/smtp-groups/${id}`);
export const createSmtpGroup = (data) => client.post('/smtp-groups', data);
export const updateSmtpGroup = (id, data) => client.put(`/smtp-groups/${id}`, data);
export const deleteSmtpGroup = (id) => client.delete(`/smtp-groups/${id}`);
export const bulkActionSmtpGroups = (action, ids) => client.post('/smtp-groups/bulk-action', { action, ids });
