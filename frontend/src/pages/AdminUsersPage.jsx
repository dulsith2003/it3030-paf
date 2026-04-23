import React, { useEffect, useState } from 'react';

import { apiFetch } from '../api/client';

const allRoles = ['USER', 'ADMIN', 'TECHNICIAN'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/admin/users');
      setUsers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function toggleRole(userId, role) {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        const hasRole = user.roles.includes(role);
        const nextRoles = hasRole
          ? user.roles.filter((entry) => entry !== role)
          : [...user.roles, role];

        return { ...user, roles: nextRoles };
      })
    );
  }

  async function saveRoles(user) {
    if (!user.roles || user.roles.length === 0) {
      setError('User must keep at least one role.');
      return;
    }

    try {
      await apiFetch(`/api/admin/users/${user.id}/roles`, {
        method: 'PUT',
        body: JSON.stringify({ roles: user.roles })
      });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteUser(user) {
    try {
      await apiFetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="panel">
      <div className="row-between">
        <h2>Admin User Management</h2>
        <button type="button" onClick={loadUsers}>Reload</button>
      </div>

      <p>View all users and update roles directly from this panel.</p>
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <ul className="card-list">
          {users.map((user) => (
            <li className="card" key={user.id}>
              <div className="row-between">
                <strong>{user.displayName || user.email}</strong>
                <small>{user.authProvider}</small>
              </div>
              <p>{user.email}</p>

              <div className="role-row">
                {allRoles.map((role) => (
                  <label key={role}>
                    <input
                      type="checkbox"
                      checked={user.roles.includes(role)}
                      onChange={() => toggleRole(user.id, role)}
                    />
                    {role}
                  </label>
                ))}
              </div>

              <div className="row-actions">
                <button type="button" onClick={() => saveRoles(user)}>Save Roles</button>
                <button type="button" className="danger" onClick={() => deleteUser(user)}>
                  Delete User
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
