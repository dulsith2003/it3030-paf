import React, { useEffect, useState } from 'react';

import { createBooking, getResources } from '../services/bookingService';

const initialForm = {
  resourceId: '',
  date: '',
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: 1
};

export default function BookingForm() {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    setLoadingResources(true);
    try {
      const data = await getResources();
      setResources(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoadingResources(false);
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }

  function validateForm() {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!form.resourceId) {
      errors.resourceId = 'Please select a resource.';
    }

    if (!form.date) {
      errors.date = 'Please select a date.';
    } else if (form.date < today) {
      errors.date = 'Cannot book for past dates.';
    }

    if (!form.startTime) {
      errors.startTime = 'Please select a start time.';
    }

    if (!form.endTime) {
      errors.endTime = 'Please select an end time.';
    }

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errors.endTime = 'End time must be after start time.';
    }

    if (!form.purpose || !form.purpose.trim()) {
      errors.purpose = 'Please provide a purpose for the booking.';
    }

    if (!form.expectedAttendees || form.expectedAttendees < 1) {
      errors.expectedAttendees = 'Expected attendees must be at least 1.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await createBooking({
        ...form,
        expectedAttendees: Number(form.expectedAttendees)
      });
      setSuccess('Booking created successfully.');
      setForm((prev) => ({
        ...initialForm,
        resourceId: prev.resourceId
      }));
    } catch (err) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel booking-panel">
      <div className="booking-header">
        <div>
          <h2>Create Booking</h2>
          <p>Submit a booking request for a campus resource.</p>
        </div>
        <div className="booking-chip">Backend: /api/bookings</div>
      </div>

      {error && <div className="booking-alert booking-alert-error">{error}</div>}
      {success && <div className="booking-alert booking-alert-success">{success}</div>}

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="booking-form-grid">
          <label className="booking-field booking-field-full">
            <span>Resource</span>
            <select
              value={form.resourceId}
              onChange={(event) => updateField('resourceId', event.target.value)}
              required
              disabled={loadingResources || loading}
            >
              <option value="">{loadingResources ? 'Loading resources...' : 'Select a resource'}</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name || resource.id}
                  {resource.location ? ` - ${resource.location}` : ''}
                </option>
              ))}
            </select>
            {fieldErrors.resourceId && <small className="field-error">{fieldErrors.resourceId}</small>}
            <small>Pick the resource you want to book.</small>
          </label>

          <label className="booking-field">
            <span>Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
              required
              disabled={loading}
              min={new Date().toISOString().split('T')[0]}
            />
            {fieldErrors.date && <small className="field-error">{fieldErrors.date}</small>}
          </label>

          <label className="booking-field">
            <span>Start Time</span>
            <input
              type="time"
              value={form.startTime}
              onChange={(event) => updateField('startTime', event.target.value)}
              required
              disabled={loading}
            />
            {fieldErrors.startTime && <small className="field-error">{fieldErrors.startTime}</small>}
          </label>

          <label className="booking-field">
            <span>End Time</span>
            <input
              type="time"
              value={form.endTime}
              onChange={(event) => updateField('endTime', event.target.value)}
              required
              disabled={loading}
            />
            {fieldErrors.endTime && <small className="field-error">{fieldErrors.endTime}</small>}
          </label>

          <label className="booking-field booking-field-full">
            <span>Purpose</span>
            <textarea
              rows={4}
              value={form.purpose}
              onChange={(event) => updateField('purpose', event.target.value)}
              placeholder="Short reason for the booking"
              required
              disabled={loading}
            />
            {fieldErrors.purpose && <small className="field-error">{fieldErrors.purpose}</small>}
          </label>

          <label className="booking-field booking-field-narrow">
            <span>Expected Attendees</span>
            <input
              type="number"
              min={1}
              value={form.expectedAttendees}
              onChange={(event) => updateField('expectedAttendees', event.target.value)}
              required
              disabled={loading}
            />
            {fieldErrors.expectedAttendees && <small className="field-error">{fieldErrors.expectedAttendees}</small>}
          </label>
        </div>

        <div className="booking-form-actions">
          <button type="submit" className="booking-submit" disabled={loading || loadingResources}>
            {loading ? 'Submitting...' : 'Submit Booking'}
          </button>
        </div>
      </form>
    </section>
  );
}