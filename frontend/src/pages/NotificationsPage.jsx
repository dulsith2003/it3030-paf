import React, { useEffect, useMemo, useState } from 'react';

import { apiFetch } from '../api/client';
import { useAuth } from '../auth/AuthProvider';

const defaultForm = {
  userId: '',
  title: '',
  message: '',
  type: 'INFO',
  read: false
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = useMemo(() => user?.roles?.includes('ADMIN'), [user]);

  async function loadNotifications() {
    setLoading(true);
    setError('');
    try {
      const query = isAdmin ? '?all=true' : '';
      const data = await apiFetch(`/api/notifications${query}`);
      setNotifications(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [isAdmin]);

  async function handleCreate(event) {
    event.preventDefault();
    setError('');

    const payload = {
      title: form.title,
      message: form.message,
      type: form.type,
      read: form.read
    };

    if (isAdmin && form.userId.trim()) {
      payload.userId = form.userId.trim();
    }

    try {
      await apiFetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setForm(defaultForm);
      await loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleRead(notification) {
    try {
      await apiFetch(`/api/notifications/${notification.id}/read`, {
        method: 'PATCH',
        body: JSON.stringify({ read: !notification.read })
      });
      await loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteNotification(notification) {
    try {
      await apiFetch(`/api/notifications/${notification.id}`, { method: 'DELETE' });
      await loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="grid-view">
      <article className="panel">
        <h2>Notification Panel</h2>
        <p>Manage your notifications. Admins can post for any user ID.</p>

        <form onSubmit={handleCreate} className="form-grid">
          {isAdmin && (
            <label>
              Target user ID
              <input
                value={form.userId}
                onChange={(event) => setForm((prev) => ({ ...prev, userId: event.target.value }))}
                placeholder="Optional for admin"
              />
            </label>
          )}

          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>

          <label>
            Message
            <textarea
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              rows={4}
              required
            />
          </label>

          <label>
            Type
            <input
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
              required
            />
          </label>

          <label className="inline-check">
            <input
              type="checkbox"
              checked={form.read}
              onChange={(event) => setForm((prev) => ({ ...prev, read: event.target.checked }))}
            />
            Mark as read immediately
          </label>

          <button type="submit">Create notification</button>
        </form>

        {error && <p className="error">{error}</p>}
      </article>

      <article className="panel">
        <div className="row-between">
          <h3>Existing notifications</h3>
          <button type="button" onClick={loadNotifications}>Refresh</button>
        </div>

        {loading ? (
          <p>Loading notifications...</p>
        ) : (
          <ul className="card-list">
            {notifications.map((notification) => (
              <li key={notification.id} className="card">
                <div className="row-between">
                  <strong>{notification.title}</strong>
                  <span className={notification.read ? 'badge muted' : 'badge'}>
                    {notification.read ? 'Read' : 'Unread'}
                  </span>
                </div>
                <p>{notification.message}</p>
                <small>Type: {notification.type} | User ID: {notification.userId}</small>
                <div className="row-actions">
                  <button type="button" onClick={() => toggleRead(notification)}>
                    Toggle Read
                  </button>
                  <button type="button" className="danger" onClick={() => deleteNotification(notification)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
