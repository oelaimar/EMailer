import client from './client';

export const spfCheck = (domains) => client.post('/tools/spf-check', { domains });
export const blacklistCheck = (type, text) => client.post('/tools/blacklist-check', { type, text });
export const extractValues = (type, unique, text) => client.post('/tools/extract-values', { type, unique, text });
export const extractMailbox = (data) => client.post('/tools/extract-mailbox', data);
