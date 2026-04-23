import React, { useEffect, useState } from 'react';

import { useAuth } from '../../auth/AuthProvider';
import { getAllTickets, assignTicket, rejectTicket } from '../../api/ticketService';
import TicketCard from '../../components/tickets/TicketCard';

/**
 * Module C – AllTickets page (ADMIN role)
 * Lists every ticket in the system with assign / reject inline actions.
 */
const STATUS_OPTIONS = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

export default function AllTickets() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // ── Assign modal state ────────────────────────────────────────────────────
    const [assignTarget, setAssignTarget] = useState(null);
    const [assignTechnician, setAssignTechnician] = useState('');
    const [assignNotes, setAssignNotes] = useState('');
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignError, setAssignError] = useState('');

    // ── Reject modal state ────────────────────────────────────────────────────
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectLoading, setRejectLoading] = useState(false);
    const [rejectError, setRejectError] = useState('');

    useEffect(() => {
        loadTickets();
    }, [statusFilter]);

    async function loadTickets() {
        setLoading(true);
        setError('');
        try {
            const data = await getAllTickets(user, statusFilter || null);
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load tickets.');
        } finally {
            setLoading(false);
        }
    }

    // ── Assign handlers ───────────────────────────────────────────────────────
    function openAssign(ticket) {
        setAssignTarget(ticket);
        setAssignTechnician(ticket.assignedTechnician || '');
        setAssignNotes(ticket.resolutionNotes || '');
        setAssignError('');
    }

    async function handleAssign(e) {
        e.preventDefault();
        if (!assignTechnician.trim()) {
            setAssignError('Technician name is required.');
            return;
        }
        setAssignLoading(true);
        setAssignError('');
        try {
            await assignTicket(
                assignTarget.id,
                { assignedTechnician: assignTechnician.trim(), resolutionNotes: assignNotes.trim() || undefined },
                user
            );
            setAssignTarget(null);
            loadTickets();
        } catch (err) {
            setAssignError(err.message || 'Assignment failed.');
        } finally {
            setAssignLoading(false);
        }
    }

    // ── Reject handlers ───────────────────────────────────────────────────────
    function openReject(ticket) {
        setRejectTarget(ticket);
        setRejectReason('');
        setRejectError('');
    }

    async function handleReject(e) {
        e.preventDefault();
        if (!rejectReason.trim()) {
            setRejectError('Rejection reason is required.');
            return;
        }
        setRejectLoading(true);
        setRejectError('');
        try {
            await rejectTicket(rejectTarget.id, { rejectionReason: rejectReason.trim() }, user);
            setRejectTarget(null);
            loadTickets();
        } catch (err) {
            setRejectError(err.message || 'Rejection failed.');
        } finally {
            setRejectLoading(false);
        }
    }

    return (
        <section className="panel ticket-panel">
            <div className="ticket-panel-header">
                <div>
                    <h2>All Tickets</h2>
                    <p>Manage and action all campus maintenance and incident reports.</p>
                </div>
                <div className="ticket-panel-actions">
                    <select
                        className="ticket-filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {s || 'All Statuses'}
                            </option>
                        ))}
                    </select>
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
            ) : tickets.length === 0 ? (
                <div className="ticket-empty-state">
                    <p>No tickets found{statusFilter ? ` with status "${statusFilter}"` : ''}.</p>
                </div>
            ) : (
                <div className="ticket-grid">
                    {tickets.map((t) => (
                        <TicketCard
                            key={t.id}
                            ticket={t}
                            onAssign={openAssign}
                            onReject={openReject}
                        />
                    ))}
                </div>
            )}

            {/* ── Assign Modal ─────────────────────────────────────────────────── */}
            {assignTarget && (
                <div className="ticket-modal-overlay" onClick={() => setAssignTarget(null)}>
                    <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Assign Ticket</h3>
                        <p className="ticket-modal-sub">
                            Ticket: <strong>{assignTarget.category}</strong> @ {assignTarget.resourceLocation}
                        </p>
                        {assignError && <div className="ticket-form-error">{assignError}</div>}
                        <form onSubmit={handleAssign}>
                            <div className="ticket-form-group">
                                <label htmlFor="at-tech">Technician Name</label>
                                <input
                                    id="at-tech"
                                    type="text"
                                    placeholder="Enter technician name"
                                    value={assignTechnician}
                                    onChange={(e) => setAssignTechnician(e.target.value)}
                                    disabled={assignLoading}
                                />
                            </div>
                            <div className="ticket-form-group">
                                <label htmlFor="at-notes">Resolution Notes (optional)</label>
                                <textarea
                                    id="at-notes"
                                    rows={3}
                                    value={assignNotes}
                                    onChange={(e) => setAssignNotes(e.target.value)}
                                    disabled={assignLoading}
                                />
                            </div>
                            <div className="ticket-modal-footer">
                                <button type="button" className="ticket-btn ticket-btn-secondary" onClick={() => setAssignTarget(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="ticket-btn ticket-btn-primary" disabled={assignLoading}>
                                    {assignLoading ? 'Assigning…' : 'Confirm Assign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Reject Modal ─────────────────────────────────────────────────── */}
            {rejectTarget && (
                <div className="ticket-modal-overlay" onClick={() => setRejectTarget(null)}>
                    <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Reject Ticket</h3>
                        <p className="ticket-modal-sub">
                            Ticket: <strong>{rejectTarget.category}</strong> @ {rejectTarget.resourceLocation}
                        </p>
                        {rejectError && <div className="ticket-form-error">{rejectError}</div>}
                        <form onSubmit={handleReject}>
                            <div className="ticket-form-group">
                                <label htmlFor="rj-reason">Rejection Reason</label>
                                <textarea
                                    id="rj-reason"
                                    rows={3}
                                    maxLength={400}
                                    placeholder="Explain why this ticket is being rejected…"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    disabled={rejectLoading}
                                />
                            </div>
                            <div className="ticket-modal-footer">
                                <button type="button" className="ticket-btn ticket-btn-secondary" onClick={() => setRejectTarget(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="ticket-btn ticket-btn-danger" disabled={rejectLoading}>
                                    {rejectLoading ? 'Rejecting…' : 'Confirm Reject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
