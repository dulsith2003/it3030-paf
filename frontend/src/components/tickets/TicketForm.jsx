import React, { useState } from 'react';

/**
 * Module C – TicketForm component
 * Used inside CreateTicket.jsx to collect ticket data from USER.
 * Props:
 *   onSubmit(formData) – called with validated form data
 *   loading  – boolean
 *   error    – string | null
 */

const CATEGORIES = [
    'Electrical',
    'Plumbing',
    'Network / IT',
    'HVAC / Air Conditioning',
    'Furniture',
    'Security',
    'Cleaning',
    'Other',
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function TicketForm({ onSubmit, loading, error }) {
    const [form, setForm] = useState({
        resourceLocation: '',
        category: CATEGORIES[0],
        description: '',
        priority: 'MEDIUM',
        preferredContact: '',
    });
    const [validationError, setValidationError] = useState('');

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setValidationError('');
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!form.resourceLocation.trim()) {
            setValidationError('Resource / location is required.');
            return;
        }
        if (!form.description.trim()) {
            setValidationError('Description is required.');
            return;
        }
        if (!form.preferredContact.trim()) {
            setValidationError('Preferred contact is required.');
            return;
        }

        onSubmit({ ...form });
    }

    const displayError = validationError || error;

    return (
        <form className="ticket-form" onSubmit={handleSubmit} noValidate>
            {displayError && (
                <div className="ticket-form-error" role="alert">
                    {displayError}
                </div>
            )}

            <div className="ticket-form-group">
                <label htmlFor="tf-location">Location / Resource</label>
                <input
                    id="tf-location"
                    name="resourceLocation"
                    type="text"
                    placeholder="e.g. Block A – Room 204"
                    maxLength={120}
                    required
                    value={form.resourceLocation}
                    onChange={handleChange}
                    disabled={loading}
                />
            </div>

            <div className="ticket-form-group">
                <label htmlFor="tf-category">Category</label>
                <select
                    id="tf-category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    disabled={loading}
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            <div className="ticket-form-group">
                <label htmlFor="tf-priority">Priority</label>
                <select
                    id="tf-priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    disabled={loading}
                >
                    {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>
            </div>

            <div className="ticket-form-group">
                <label htmlFor="tf-description">Description</label>
                <textarea
                    id="tf-description"
                    name="description"
                    rows={5}
                    maxLength={1200}
                    placeholder="Describe the issue in detail..."
                    required
                    value={form.description}
                    onChange={handleChange}
                    disabled={loading}
                />
            </div>

            <div className="ticket-form-group">
                <label htmlFor="tf-contact">Preferred Contact</label>
                <input
                    id="tf-contact"
                    name="preferredContact"
                    type="text"
                    placeholder="Email or phone number"
                    maxLength={120}
                    required
                    value={form.preferredContact}
                    onChange={handleChange}
                    disabled={loading}
                />
            </div>

            <div className="ticket-form-footer">
                <button
                    type="submit"
                    className="ticket-btn ticket-btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Submitting…' : 'Submit Ticket'}
                </button>
            </div>
        </form>
    );
}
