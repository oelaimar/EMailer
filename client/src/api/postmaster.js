import client from './client';

export const getPostmasterSources = () => client.post('/postmaster/sources');
export const getPostmasterMessages = (data) => client.post('/postmaster/messages', data);
export const refreshPostmasterMailbox = (data) => client.post('/postmaster/refresh', data);
export const getPostmasterMessageDetail = (id) => client.get(`/postmaster/messages/${id}/detail`);
export const deletePostmasterMessages = (data) => client.post('/postmaster/messages/delete', data);
export const exportPostmasterReplyAccounts = (data) => client.post('/postmaster/export', data);
export const getPostmasterRuns = () => client.get('/postmaster/runs');
export const getPostmasterRunLogs = (id) => client.get(`/postmaster/runs/${id}/logs`);
export const testPostmasterConnection = (id) => client.post(`/postmaster/${id}/test-connection`);
