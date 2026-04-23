import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Module C – TicketCard component
 * Displays a summary of a single ticket in list views.
 * Props:
 *   ticket  – TicketResponse object
 *   showActions – boolean (optional, show action buttons)
 *   onAssign    – fn(ticket) called when admin clicks Assign
 *   onReject    – fn(ticket) called when admin clicks Reject
 *   onStatusChange – fn(ticket) called when technician clicks change status
 */
const PRIORITY_CLASS = {
    LOW: 'ticket-priority-low',
    MEDIUM: 'ticket-priority-medium',
    HIGH: 'ticket-priority-high',
    CRITICAL: 'ticket-priority-critical',
};

const STATUS_CLASS = {
    OPEN: 'ticket-status-open',
    IN_PROGRESS: 'ticket-status-inprogress',
    RESOLVED: 'ticket-status-resolved',
    CLOSED: 'ticket-status-closed',
    REJECTED: 'ticket-status-rejected',
};

export default function TicketCard({ ticket, onAssign, onReject, onStatusChange }) {
    if (!ticket) return null;

    const priorityCls = PRIORITY_CLASS[ticket.priority] || 'ticket-priority-low';
    const statusCls = STATUS_CLASS[ticket.status] || 'ticket-status-open';
    const createdDate = ticket.createdAt
        ? new Date(ticket.createdAt).toLocaleDateString()
        : '—';

    return (
        <article className="ticket-card">
            <div className="ticket-card-header">
                <span className={`ticket-badge ${priorityCls}`}>{ticket.priority}</span>
                <span className={`ticket-badge ${statusCls}`}>{ticket.status?.replace('_', ' ')}</span>
            </div>

            <h3 className="ticket-card-category">{ticket.category}</h3>
            <p className="ticket-card-location">📍 {ticket.resourceLocation}</p>
            <p className="ticket-card-description">{ticket.description}</p>

            <div className="ticket-card-meta">
                <span>🗓 {createdDate}</span>
                {ticket.assignedTechnician && (
                    <span>🔧 {ticket.assignedTechnician}</span>
                )}
            </div>

            <div className="ticket-card-actions">
                <Link className="ticket-btn ticket-btn-primary" to={`/tickets/${ticket.id}`}>
                    View Details
                </Link>

                {typeof onAssign === 'function' && ticket.status === 'OPEN' && (
                    <button
                        type="button"
                        className="ticket-btn ticket-btn-secondary"
                        onClick={() => onAssign(ticket)}
                    >
                        Assign
                    </button>
                )}

                {typeof onReject === 'function' &&
                    ticket.status !== 'CLOSED' &&
                    ticket.status !== 'REJECTED' && (
                        <button
                            type="button"
                            className="ticket-btn ticket-btn-danger"
                            onClick={() => onReject(ticket)}
                        >
                            Reject
                        </button>
                    )}

                {typeof onStatusChange === 'function' && (
                    <button
                        type="button"
                        className="ticket-btn ticket-btn-secondary"
                        onClick={() => onStatusChange(ticket)}
                    >
                        Update Status
                    </button>
                )}
            </div>
        </article>
    );
}
