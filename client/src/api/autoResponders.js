import client from './client';

export const getAutoResponders = (params) => client.get('/auto-responders', { params });
export const getAutoResponder = (id) => client.get(`/auto-responders/${id}`);
export const createAutoResponder = (data) => client.post('/auto-responders', data);
export const updateAutoResponder = (id, data) => client.put(`/auto-responders/${id}`, data);
export const deleteAutoResponder = (id) => client.delete(`/auto-responders/${id}`);
export const bulkActionAutoResponders = (action, ids) => client.post('/auto-responders/bulk-action', { action, ids });
