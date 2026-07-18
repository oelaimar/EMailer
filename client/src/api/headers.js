import client from './client';

export const getHeaders = (params) => client.get('/headers', { params });
export const getHeader = (id) => client.get(`/headers/${id}`);
export const createHeader = (data) => client.post('/headers', data);
export const updateHeader = (id, data) => client.put(`/headers/${id}`, data);
export const deleteHeader = (id) => client.delete(`/headers/${id}`);
export const bulkActionHeaders = (action, ids) => client.post('/headers/bulk-action', { action, ids });
