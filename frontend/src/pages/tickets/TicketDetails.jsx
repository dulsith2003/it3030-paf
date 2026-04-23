import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth/AuthProvider';
import { getTicketById } from '../../api/ticketService';
import CommentSection from '../../components/tickets/CommentSection';

/**
 * Module C – TicketDetails page (SHARED – all roles)
 * Displays full ticket info + CommentSection.
 * Action buttons (assign, reject, status) are role-gated.
 */

const PRIORITY_LABEL = {
    LOW: '🟢 LOW',
    MEDIUM: '🟡 MEDIUM',
    HIGH: '🟠 HIGH',
    CRITICAL: '🔴 CRITICAL',
};

const STATUS_LABEL = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
};

export default function TicketDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isAdmin = user?.roles?.includes('ADMIN');
    const isTechnician = user?.roles?.includes('TECHNICIAN');
    const canComment = isAdmin || isTechnician;

    const loadTicket = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getTicketById(id, user);
            setTicket(data);
        } catch (err) {
            setError(err.message || 'Failed to load ticket.');
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        loadTicket();
    }, [loadTicket]);

    if (loading) return <p className="ticket-loading panel">Loading ticket…</p>;
    if (error) return <div className="panel ticket-alert ticket-alert-error">{error}</div>;
    if (!ticket) return null;

    const createdDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—';
    const updatedDate = ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : '—';

    return (
        <section className="panel ticket-panel">
            {/* ── Back nav ──────────────────────────────────────────────────────── */}
            <button
                type="button"
                className="ticket-btn ticket-btn-secondary ticket-back-btn"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            {/* ── Ticket Header ─────────────────────────────────────────────────── */}
            <div className="ticket-detail-header">
                <div>
                    <h2 className="ticket-detail-category">{ticket.category}</h2>
                    <p className="ticket-detail-location">📍 {ticket.resourceLocation}</p>
                </div>
                <div className="ticket-detail-badges">
                    <span className="ticket-badge ticket-badge-status">
                        {STATUS_LABEL[ticket.status] || ticket.status}
                    </span>
                    <span className="ticket-badge ticket-badge-priority">
                        {PRIORITY_LABEL[ticket.priority] || ticket.priority}
                    </span>
                </div>
            </div>

            {/* ── Metadata grid ─────────────────────────────────────────────────── */}
            <dl className="ticket-detail-meta">
                <div>
                    <dt>Submitted by</dt>
                    <dd>{ticket.createdBy}</dd>
                </div>
                <div>
                    <dt>Created</dt>
                    <dd>{createdDate}</dd>
                </div>
                <div>
                    <dt>Last updated</dt>
                    <dd>{updatedDate}</dd>
                </div>
                <div>
                    <dt>Preferred contact</dt>
                    <dd>{ticket.preferredContact}</dd>
                </div>
                {ticket.assignedTechnician && (
                    <div>
                        <dt>Assigned technician</dt>
                        <dd>{ticket.assignedTechnician}</dd>
                    </div>
                )}
            </dl>

            {/* ── Description ───────────────────────────────────────────────────── */}
            <div className="ticket-detail-section">
                <h4>Description</h4>
                <p className="ticket-detail-description">{ticket.description}</p>
            </div>

            {/* ── Resolution / Rejection notes ──────────────────────────────────── */}
            {ticket.resolutionNotes && (
                <div className="ticket-detail-section ticket-detail-resolution">
                    <h4>Resolution Notes</h4>
                    <p>{ticket.resolutionNotes}</p>
                </div>
            )}

            {ticket.status === 'REJECTED' && ticket.rejectionReason && (
                <div className="ticket-detail-section ticket-detail-rejection">
                    <h4>Rejection Reason</h4>
                    <p>{ticket.rejectionReason}</p>
                </div>
            )}

            {/* ── Attachments ───────────────────────────────────────────────────── */}
            {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="ticket-detail-section">
                    <h4>Attachments ({ticket.attachments.length} / 3)</h4>
                    <ul className="ticket-attachment-list">
                        {ticket.attachments.map((a, i) => (
                            <li key={i}>
                                📎 {a.fileName} — {a.contentType} — {a.sizeKb} KB
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Comments ──────────────────────────────────────────────────────── */}
            <CommentSection
                ticketId={ticket.id}
                comments={ticket.comments || []}
                onRefresh={loadTicket}
                canComment={canComment}
            />
        </section>
    );
}
