/**
 * Module C – Ticket API Service
 * Uses the existing apiFetch client (no modification to client.js).
 * Role and user identity are passed via X-User-Name / X-User-Role headers,
 * extracted from the user object stored in AuthProvider.
 */
import { apiFetch } from './client';

// ─── helpers ────────────────────────────────────────────────────────────────

function authHeaders(user) {
    return {
        'X-User-Name': user?.email || user?.displayName || 'anonymous',
        'X-User-Role': user?.roles?.[0] || 'USER',
    };
}

// ─── USER endpoints ──────────────────────────────────────────────────────────

/**
 * POST /api/tickets
 * Creates a new ticket. Accessible by USER.
 * @param {object} payload  – { resourceLocation, category, description, priority, preferredContact, attachments? }
 * @param {object} user     – auth user object from useAuth()
 */
export async function createTicket(payload, user) {
    return apiFetch('/api/tickets', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: authHeaders(user),
    });
}

/**
 * GET /api/tickets?mine=true
 * Returns only tickets created by the current user.
 * @param {object} user
 */
export async function getMyTickets(user) {
    return apiFetch('/api/tickets?mine=true', {
        headers: authHeaders(user),
    });
}

/**
 * GET /api/tickets/{id}
 * Fetches a single ticket by id.
 * @param {string} ticketId
 * @param {object} user
 */
export async function getTicketById(ticketId, user) {
    return apiFetch(`/api/tickets/${ticketId}`, {
        headers: authHeaders(user),
    });
}

// ─── ADMIN endpoints ─────────────────────────────────────────────────────────

/**
 * GET /api/tickets
 * Returns all tickets. Accessible by ADMIN.
 * @param {object} user
 * @param {string|null} status  – optional TicketStatus filter
 */
export async function getAllTickets(user, status = null) {
    const qs = status ? `?status=${status}` : '';
    return apiFetch(`/api/tickets${qs}`, {
        headers: authHeaders(user),
    });
}

/**
 * PUT /api/tickets/{id}/assign
 * Assigns a technician to a ticket. ADMIN only.
 * @param {string} ticketId
 * @param {{ assignedTechnician: string, resolutionNotes?: string }} payload
 * @param {object} user
 */
export async function assignTicket(ticketId, payload, user) {
    return apiFetch(`/api/tickets/${ticketId}/assign`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: authHeaders(user),
    });
}

/**
 * PUT /api/tickets/{id}/reject
 * Rejects a ticket with a reason. ADMIN only.
 * @param {string} ticketId
 * @param {{ rejectionReason: string }} payload
 * @param {object} user
 */
export async function rejectTicket(ticketId, payload, user) {
    return apiFetch(`/api/tickets/${ticketId}/reject`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: authHeaders(user),
    });
}

// ─── TECHNICIAN endpoints ────────────────────────────────────────────────────

/**
 * PUT /api/tickets/{id}/status
 * Updates ticket workflow status. TECHNICIAN / ADMIN.
 * @param {string} ticketId
 * @param {{ status: string, resolutionNotes?: string }} payload
 * @param {object} user
 */
export async function updateTicketStatus(ticketId, payload, user) {
    return apiFetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: authHeaders(user),
    });
}

// ─── COMMON comment endpoints ─────────────────────────────────────────────────

/**
 * GET /api/tickets/{id}/comments
 * @param {string} ticketId
 * @param {object} user
 */
export async function getComments(ticketId, user) {
    return apiFetch(`/api/tickets/${ticketId}/comments`, {
        headers: authHeaders(user),
    });
}

/**
 * POST /api/tickets/{id}/comments
 * @param {string} ticketId
 * @param {{ text: string }} payload
 * @param {object} user
 */
export async function addComment(ticketId, payload, user) {
    return apiFetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: authHeaders(user),
    });
}

/**
 * DELETE /api/comments/{commentId}?ticketId=...
 * Comment owner only.
 * @param {string} commentId
 * @param {string} ticketId
 * @param {object} user
 */
export async function deleteComment(commentId, ticketId, user) {
    return apiFetch(`/api/comments/${commentId}?ticketId=${ticketId}`, {
        method: 'DELETE',
        headers: authHeaders(user),
    });
}
