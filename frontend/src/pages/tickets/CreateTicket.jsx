import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth/AuthProvider';
import { createTicket } from '../../api/ticketService';
import TicketForm from '../../components/tickets/TicketForm';

/**
 * Module C – CreateTicket page (USER role)
 * Hosts the TicketForm component and handles submission.
 */
export default function CreateTicket() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(formData) {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await createTicket(formData, user);
            setSuccess('Ticket submitted successfully!');
            setTimeout(() => navigate('/tickets/my'), 1500);
        } catch (err) {
            setError(err.message || 'Failed to submit ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="panel ticket-panel">
            <div className="ticket-panel-header">
                <div>
                    <h2>Report an Issue</h2>
                    <p>Fill in the details below to submit a maintenance or incident ticket.</p>
                </div>
            </div>

            {success && <div className="ticket-alert ticket-alert-success">{success}</div>}

            <TicketForm onSubmit={handleSubmit} loading={loading} error={error} />
        </section>
    );
}
