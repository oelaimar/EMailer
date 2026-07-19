import client from './client';

export const getVerticals = (params) => client.get('/verticals', { params });
export const getVertical = (id) => client.get(`/verticals/${id}`);
export const createVertical = (data) => client.post('/verticals', data);
export const updateVertical = (id, data) => client.put(`/verticals/${id}`, data);
export const deleteVertical = (id) => client.delete(`/verticals/${id}`);
export const bulkActionVerticals = (action, ids) => client.post('/verticals/bulk-action', { action, ids });
