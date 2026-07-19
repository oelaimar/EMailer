import client from './client';

export const getElasticIps = (params) => client.get('/elastic-ips', { params });
export const getElasticIp = (id) => client.get(`/elastic-ips/${id}`);
export const createElasticIp = (data) => client.post('/elastic-ips', data);
export const allocateElasticIps = (data) => client.post('/elastic-ips/allocate', data);
export const releaseElasticIps = (ids) => client.post('/elastic-ips/release', { ids });
export const deleteElasticIp = (id) => client.delete(`/elastic-ips/${id}`);
