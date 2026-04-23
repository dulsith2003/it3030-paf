import React, { useEffect, useState } from 'react';

import { approveBooking, getAllBookings, rejectBooking, getResources } from '../services/bookingService';

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

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [bookingsData, resourcesData] = await Promise.all([
        getAllBookings(),
        getResources()
      ]);
      setBookings(bookingsData || []);
      setResources(resourcesData || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin bookings');
    } finally {
      setLoading(false);
    }
  }

  function getResourceName(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? resource.name : resourceId;
  }

  function applyFilters() {
    let filtered = [...bookings];

    if (filters.status) {
      filtered = filtered.filter(b => b.status === filters.status);
    }

    if (filters.date) {
      filtered = filtered.filter(b => b.date === filters.date);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(b =>
        getResourceName(b.resourceId).toLowerCase().includes(searchLower) ||
        b.resourceId.toLowerCase().includes(searchLower) ||
        b.userId.toLowerCase().includes(searchLower) ||
        (b.purpose && b.purpose.toLowerCase().includes(searchLower))
      );
    }

    setFilteredBookings(filtered);
  }

  function updateFilter(field, value) {
    setFilters(prev => ({ ...prev, [field]: value }));
  }

  function clearFilters() {
    setFilters({ status: '', date: '', search: '' });
  }

  async function handleApprove(id) {
    setError('');
    try {
      await approveBooking(id);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to approve booking');
    }
  }

  async function handleReject(id) {
    const reason = window.prompt('Enter reject reason:');
    if (!reason || !reason.trim()) {
      return;
    }

    setError('');
    try {
      await rejectBooking(id, reason.trim());
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to reject booking');
    }
  }

  return (
    <section className="panel booking-panel">
      <div className="booking-header">
        <div>
          <h2>Admin Bookings</h2>
          <p>Review booking requests and approve or reject pending items.</p>
        </div>
        <button type="button" className="secondary" onClick={loadData} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="booking-alert booking-alert-error">{error}</div>}

      <div className="booking-filters">
        <div className="filter-group">
          <label>
            Status:
            <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <label>
            Date:
            <input type="date" value={filters.date} onChange={(e) => updateFilter('date', e.target.value)} />
          </label>
          <label>
            Search (Resource/User/Purpose):
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search..."
            />
          </label>
          <button type="button" onClick={clearFilters} className="secondary">Clear Filters</button>
        </div>
      </div>

      {loading ? (
        <p className="booking-loading">Loading bookings...</p>
      ) : (
        <div className="table-wrap">
          <table className="booking-table">
            <thead>
              <tr>
                <th>userId</th>
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
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="booking-empty-state">
                      <strong>No bookings found.</strong>
                      <span>Pending requests will appear here for review.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.userId}</td>
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
                      {booking.status === 'PENDING' ? (
                        <div className="row-actions booking-action-group">
                          <button type="button" onClick={() => handleApprove(booking.id)}>
                            Approve
                          </button>
                          <button type="button" className="danger" onClick={() => handleReject(booking.id)}>
                            Reject
                          </button>
                        </div>
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