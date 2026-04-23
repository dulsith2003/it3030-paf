import React, { useState } from 'react';

import { addComment, deleteComment } from '../../api/ticketService';
import { useAuth } from '../../auth/AuthProvider';

/**
 * Module C – CommentSection component
 * Displays existing comments and lets authenticated users add / delete comments.
 *
 * Props:
 *   ticketId   – string
 *   comments   – TicketCommentResponse[]
 *   onRefresh  – fn() called after a mutation so the parent can reload
 *   canComment – boolean (TECHNICIAN or ADMIN)
 */
export default function CommentSection({ ticketId, comments = [], onRefresh, canComment }) {
    const { user } = useAuth();
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState('');
    const [error, setError] = useState('');

    async function handleAdd(e) {
        e.preventDefault();
        if (!text.trim()) return;
        setSubmitting('add');
        setError('');
        try {
            await addComment(ticketId, { text: text.trim() }, user);
            setText('');
            onRefresh?.();
        } catch (err) {
            setError(err.message || 'Failed to add comment.');
        } finally {
            setSubmitting('');
        }
    }

    async function handleDelete(commentId) {
        if (!window.confirm('Delete this comment?')) return;
        setSubmitting(commentId);
        setError('');
        try {
            await deleteComment(commentId, ticketId, user);
            onRefresh?.();
        } catch (err) {
            setError(err.message || 'Failed to delete comment.');
        } finally {
            setSubmitting('');
        }
    }

    const currentUserName = user?.email || user?.displayName || '';
    const isAdmin = user?.roles?.includes('ADMIN');

    return (
        <section className="comment-section">
            <h4 className="comment-section-title">💬 Comments</h4>

            {error && <div className="ticket-form-error">{error}</div>}

            {comments.length === 0 ? (
                <p className="comment-empty">No comments yet.</p>
            ) : (
                <ul className="comment-list">
                    {comments.map((c) => {
                        const isOwner =
                            c.authorName && c.authorName.toLowerCase() === currentUserName.toLowerCase();
                        const canDelete = isOwner || isAdmin;
                        return (
                            <li key={c.id} className="comment-item">
                                <div className="comment-meta">
                                    <strong>{c.authorName}</strong>
                                    <span className="comment-role">{c.authorRole}</span>
                                    <span className="comment-date">
                                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                                    </span>
                                </div>
                                <p className="comment-text">{c.text}</p>
                                {canDelete && (
                                    <button
                                        type="button"
                                        className="comment-delete-btn"
                                        disabled={submitting === c.id}
                                        onClick={() => handleDelete(c.id)}
                                    >
                                        {submitting === c.id ? 'Deleting…' : 'Delete'}
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {canComment && (
                <form className="comment-form" onSubmit={handleAdd}>
                    <textarea
                        className="comment-input"
                        rows={3}
                        maxLength={500}
                        placeholder="Add a comment…"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={submitting === 'add'}
                    />
                    <button
                        type="submit"
                        className="ticket-btn ticket-btn-primary"
                        disabled={submitting === 'add' || !text.trim()}
                    >
                        {submitting === 'add' ? 'Posting…' : 'Post Comment'}
                    </button>
                </form>
            )}
        </section>
    );
}
