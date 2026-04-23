import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../auth/AuthProvider';
import { getMyTickets } from '../../api/ticketService';
import TicketCard from '../../components/tickets/TicketCard';

/**
 * Module C – MyTickets page (USER role)
 * Shows all tickets created by the logged-in user.
 */
export default function MyTickets() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadTickets();
    }, []);

    async function loadTickets() {
        setLoading(true);
        setError('');
        try {
            const data = await getMyTickets(user);
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load tickets.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="panel ticket-panel">
            <div className="ticket-panel-header">
                <div>
                    <h2>My Tickets</h2>
                    <p>Track your submitted maintenance and incident reports.</p>
                </div>
                <div className="ticket-panel-actions">
                    <Link className="ticket-btn ticket-btn-primary" to="/tickets/create">
                        + New Ticket
                    </Link>
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
                    <p>No tickets found.</p>
                    <Link className="ticket-btn ticket-btn-primary" to="/tickets/create">
                        Submit your first ticket
                    </Link>
                </div>
            ) : (
                <div className="ticket-grid">
                    {tickets.map((t) => (
                        <TicketCard key={t.id} ticket={t} />
                    ))}
                </div>
            )}
        </section>
    );
}
