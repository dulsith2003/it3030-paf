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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            // Pull all tickets (TECHNICIAN can view all) then filter by assigned name
            const data = await getAllTickets(user);
            const myName = user?.email || user?.displayName || '';
            const filtered = Array.isArray(data)
                ? data.filter(
                    (t) =>
                        t.assignedTechnician &&
                        t.assignedTechnician.toLowerCase() === myName.toLowerCase()
                )
                : [];
            setTickets(filtered);
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

    return (
        <section className="panel ticket-panel">
            <div className="ticket-panel-header">
                <div>
                    <h2>Assigned Tickets</h2>
                    <p>Manage the maintenance requests assigned to you.</p>
                </div>
                <button
                    type="button"
                    className="ticket-btn ticket-btn-secondary"
                    onClick={loadTickets}
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>

            {error && <div className="ticket-alert ticket-alert-error">{error}</div>}

            {loading ? (
                <p className="ticket-loading">Loading tickets…</p>
            ) : tickets.length === 0 ? (
                <div className="ticket-empty-state">
                    <p>No tickets are currently assigned to you.</p>
                </div>
            ) : (
                <div className="ticket-grid">
                    {tickets.map((t) => (
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
