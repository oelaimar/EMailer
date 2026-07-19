import client from './client';
export const getGsuiteSendData = () => client.get('/gsuite-accounts/send-process-data');
export const sendGsuite = (data) => client.post('/gsuite-accounts/send', data);
export const getGsuiteDrops = (params) => client.get('/gsuite-accounts/drops', { params });
export const getGsuiteTests = (params) => client.get('/gsuite-accounts/tests', { params });
