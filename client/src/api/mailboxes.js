import client from './client';

export const getMailboxes = (params) => client.get('/mailboxes', { params });
export const getMailbox = (id) => client.get(`/mailboxes/${id}`);
export const createMailbox = (data) => client.post('/mailboxes', data);
export const updateMailbox = (id, data) => client.put(`/mailboxes/${id}`, data);
export const deleteMailbox = (id) => client.delete(`/mailboxes/${id}`);
export const bulkActionMailboxes = (action, ids) => client.post('/mailboxes/bulk-action', { action, ids });
export const getMailboxDomains = () => client.get('/mailboxes/domains');
