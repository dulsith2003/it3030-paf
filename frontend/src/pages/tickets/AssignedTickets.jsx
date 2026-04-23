import React, { useEffect, useState } from 'react';

import { useAuth } from '../../auth/AuthProvider';
import { getAllTickets, updateTicketStatus } from '../../api/ticketService';
import TicketCard from '../../components/tickets/TicketCard';

/**
 * Module C – AssignedTickets page (TECHNICIAN role)
 * Shows tickets assigned to the current technician, with status update capability.
 */

const NEXT_STATUS = {
    OPEN: 'IN_PROGRESS',
    IN_PROGRESS: 'RESOLVED',
    RESOLVED: 'CLOSED',
};

export default function AssignedTickets() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [allTickets, setAllTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    // Build the list of identifiers the admin might have typed for this technician
    function myIdentifiers() {
        const ids = [];
        if (user?.email) {
            ids.push(user.email.toLowerCase());
            // also add the local part before @  e.g. "john.doe" from "john.doe@campus.com"
            const local = user.email.split('@')[0];
            if (local) ids.push(local.toLowerCase());
        }
        if (user?.displayName) ids.push(user.displayName.toLowerCase());
        return ids;
    }

    // ── Status-update modal ───────────────────────────────────────────────────
    const [statusTarget, setStatusTarget] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusError, setStatusError] = useState('');

    useEffect(() => {
        loadTickets();
    }, []);

    async function loadTickets() {
        setLoading(true);
        setError('');
        try {
            const data = await getAllTickets(user);
            const all = Array.isArray(data) ? data : [];
            setAllTickets(all);

            // Filter: ticket's assignedTechnician contains any of the technician's identifiers
            const ids = myIdentifiers();
            const matched = all.filter((t) => {
                if (!t.assignedTechnician) return false;
                const assigned = t.assignedTechnician.toLowerCase();
                // exact match OR any identifier contained within the assigned string
                return ids.some((id) => assigned.includes(id) || id.includes(assigned));
            });
            setTickets(matched);
        } catch (err) {
            setError(err.message || 'Failed to load assigned tickets.');
        } finally {
            setLoading(false);
        }
    }

    function openStatusChange(ticket) {
        const next = NEXT_STATUS[ticket.status];
        setStatusTarget(ticket);
        setNewStatus(next || ticket.status);
        setResolutionNotes('');
        setStatusError('');
    }

    async function handleStatusUpdate(e) {
        e.preventDefault();
        setStatusLoading(true);
        setStatusError('');
        try {
            await updateTicketStatus(
                statusTarget.id,
                { status: newStatus, resolutionNotes: resolutionNotes.trim() || undefined },
                user
            );
            setStatusTarget(null);
            loadTickets();
        } catch (err) {
            setStatusError(err.message || 'Status update failed.');
        } finally {
            setStatusLoading(false);
        }
    }

    const availableStatuses = Object.values(NEXT_STATUS);

    // ── Manual search filter on top of auto-matched tickets ──────────────────
    const displayTickets = search.trim()
        ? allTickets.filter((t) =>
            t.assignedTechnician?.toLowerCase().includes(search.toLowerCase())
        )
        : tickets;

    return (
        <section className="panel ticket-panel">
            <div className="ticket-panel-header">
                <div>
                    <h2>Assigned Tickets</h2>
                    <p>Manage the maintenance requests assigned to you.</p>
                </div>
                <div className="ticket-panel-actions">
                    <input
                        type="text"
                        placeholder="Search by technician name…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ borderRadius: 10, padding: '0.52rem 0.7rem', border: '1px solid #d0dcff', background: '#f7faff', minWidth: 200 }}
                    />
                    <button
                        type="button"
                        className="ticket-btn ticket-btn-secondary"
                        onClick={loadTickets}
                        disabled={loading}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {error && <div className="ticket-alert ticket-alert-error">{error}</div>}

            {loading ? (
                <p className="ticket-loading">Loading tickets…</p>
            ) : displayTickets.length === 0 ? (
                <div className="ticket-empty-state">
                    <p>No tickets found{search ? ` matching "${search}"` : ' assigned to you'}.</p>
                    {!search && tickets.length === 0 && allTickets.length > 0 && (
                        <p style={{ fontSize: '0.85rem', color: '#8398be' }}>
                            Tip: Ask your admin what name they used when assigning.
                            Use the search box above to find your tickets.
                        </p>
                    )}
                </div>
            ) : (
                <div className="ticket-grid">
                    {displayTickets.map((t) => (
                        <TicketCard
                            key={t.id}
                            ticket={t}
                            onStatusChange={
                                NEXT_STATUS[t.status] ? openStatusChange : undefined
                            }
                        />
                    ))}
                </div>
            )}

            {/* ── Status Update Modal ───────────────────────────────────────── */}
            {statusTarget && (
                <div className="ticket-modal-overlay" onClick={() => setStatusTarget(null)}>
                    <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Update Ticket Status</h3>
                        <p className="ticket-modal-sub">
                            <strong>{statusTarget.category}</strong> @ {statusTarget.resourceLocation}
                        </p>
                        {statusError && <div className="ticket-form-error">{statusError}</div>}
                        <form onSubmit={handleStatusUpdate}>
                            <div className="ticket-form-group">
                                <label htmlFor="su-status">New Status</label>
                                <select
                                    id="su-status"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    disabled={statusLoading}
                                >
                                    {availableStatuses.map((s) => (
                                        <option key={s} value={s}>
                                            {s.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="ticket-form-group">
                                <label htmlFor="su-notes">Resolution Notes (optional)</label>
                                <textarea
                                    id="su-notes"
                                    rows={3}
                                    maxLength={1200}
                                    placeholder="Describe what was done…"
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    disabled={statusLoading}
                                />
                            </div>
                            <div className="ticket-modal-footer">
                                <button
                                    type="button"
                                    className="ticket-btn ticket-btn-secondary"
                                    onClick={() => setStatusTarget(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="ticket-btn ticket-btn-primary"
                                    disabled={statusLoading}
                                >
                                    {statusLoading ? 'Updating…' : 'Confirm Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
