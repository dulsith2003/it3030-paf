import React, { useEffect, useState } from 'react';

import { cancelBooking, getMyBookings, getResources } from '../services/bookingService';

function getStatusClass(status) {
  switch (status) {
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'CANCELLED':
      return 'cancelled';
    case 'COMPLETED':
      return 'completed';
    default:
      return 'pending';
  }
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [bookingsData, resourcesData] = await Promise.all([
        getMyBookings(),
        getResources()
      ]);
      setBookings(bookingsData || []);
      setResources(resourcesData || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function getResourceName(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? resource.name : resourceId;
  }

  async function handleCancel(id) {
    setError('');
    try {
      await cancelBooking(id);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    }
  }

  return (
    <section className="panel booking-panel">
      <div className="booking-header">
        <div>
          <h2>My Bookings</h2>
          <p>Track your booking requests and cancel approved ones.</p>
        </div>
        <button type="button" className="secondary" onClick={loadData} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="booking-alert booking-alert-error">{error}</div>}

      {loading ? (
        <p className="booking-loading">Loading bookings...</p>
      ) : (
        <div className="table-wrap">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Date</th>
                <th>startTime</th>
                <th>endTime</th>
                <th>purpose</th>
                <th>status</th>
                <th>adminReason</th>
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="booking-empty-state">
                      <strong>No bookings found.</strong>
                      <span>Create a new booking to see it here.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{getResourceName(booking.resourceId)}</td>
                    <td>{booking.date}</td>
                    <td>{booking.startTime}</td>
                    <td>{booking.endTime}</td>
                    <td>{booking.purpose || '-'}</td>
                    <td>
                      <span className={`booking-badge booking-badge-${getStatusClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>{booking.adminReason || '-'}</td>
                    <td>
                      {booking.status === 'APPROVED' ? (
                        <button type="button" className="danger" onClick={() => handleCancel(booking.id)}>
                          Cancel
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}