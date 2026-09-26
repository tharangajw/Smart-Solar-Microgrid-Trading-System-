import { request } from './apiClient';

export async function getSlots(filters = {}) {
  const query = new URLSearchParams();
  if (filters.nodeId) query.append('nodeId', filters.nodeId);
  if (filters.status) query.append('status', filters.status);
  if (filters.available) query.append('available', 'true');

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return await request(`/slots${queryString}`);
}

export async function getSlotById(id) {
  return await request(`/slots/${id}`);
}

export async function createSlot(data) {
  return await request('/slots', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateSlotStatus(id, status) {
  return await request(`/slots/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}
