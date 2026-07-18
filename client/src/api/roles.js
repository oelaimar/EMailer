import client from './client';

export const getRoles = (params) => client.get('/roles', { params });
export const getRole = (id) => client.get(`/roles/${id}`);
export const createRole = (data) => client.post('/roles', data);
export const updateRole = (id, data) => client.put(`/roles/${id}`, data);
export const deleteRole = (id) => client.delete(`/roles/${id}`);
export const getRoleUsers = (id) => client.get(`/roles/${id}/users`);
export const affectRoleToUsers = (roleId, userIds) => client.post('/roles/affect', { roleId, userIds });
export const affectRolesToUser = (userId, roleIds) => client.post('/roles/users', { userId, roleIds });
