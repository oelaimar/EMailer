import client from './client';

export const getSettings = () => client.get('/settings');
export const updateSettings = (data) => client.put('/settings', data);
export const getSetting = (key) => client.get(`/settings/${key}`);
