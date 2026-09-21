import { request } from './apiClient';

export async function getNodes(filters = {}) {
  const query = new URLSearchParams();
  if (filters.status) query.append('status', filters.status);
  if (filters.nearMe) query.append('nearMe', 'true');
  if (filters.lat) query.append('lat', filters.lat);
  if (filters.lng) query.append('lng', filters.lng);
  if (filters.radiusKm) query.append('radiusKm', filters.radiusKm);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return await request(`/nodes${queryString}`);
}

export async function getNodeById(id) {
  return await request(`/nodes/${id}`);
}

export async function createNode(data) {
  return await request('/nodes', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateNode(id, data) {
  return await request(`/nodes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deactivateNode(id) {
  return await request(`/nodes/${id}`, {
    method: 'DELETE'
  });
}
