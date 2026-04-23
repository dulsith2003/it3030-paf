import { apiFetch } from '../api/client';

export function createBooking(data) {
  return apiFetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function getMyBookings() {
  return apiFetch('/api/bookings/my');
}

export function getAllBookings() {
  return apiFetch('/api/bookings/admin');
}

export function approveBooking(id) {
  return apiFetch(`/api/bookings/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({})
  });
}

export function rejectBooking(id, reason) {
  return apiFetch(`/api/bookings/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason })
  });
}

export function cancelBooking(id) {
  return apiFetch(`/api/bookings/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({})
  });
}

export function getResources() {
  return apiFetch('/api/resources');
}
