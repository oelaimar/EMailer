import client from './client';

export const getDomains = (params) => client.get('/domains', { params });
export const getDomain = (id) => client.get(`/domains/${id}`);
export const createDomain = (data) => client.post('/domains', data);
export const updateDomain = (id, data) => client.put(`/domains/${id}`, data);
export const deleteDomain = (id) => client.delete(`/domains/${id}`);
export const bulkActionDomains = (action, ids) => client.post('/domains/bulk-action', { action, ids });
export const getDomainRecords = (id) => client.get(`/domains/${id}/records`);
export const setDomainRecords = (id, records) => client.post(`/domains/${id}/records`, { records });
export const getAccountDomains = () => client.get('/domains/account-domains');
export const setMultiDomainsRecords = (data) => client.post('/domains/multi-records', data);
