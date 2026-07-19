import client from './client';
export const getGmailSendData = () => client.get('/gmail-accounts/send-process-data');
export const sendGmail = (data) => client.post('/gmail-accounts/send', data);
export const getGmailDrops = (params) => client.get('/gmail-accounts/drops', { params });
export const getGmailTests = (params) => client.get('/gmail-accounts/tests', { params });
