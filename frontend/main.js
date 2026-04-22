const USER_KEY = 'module-c-current-user-v1';

const ticketForm = document.getElementById('ticketForm');
const formMessage = document.getElementById('formMessage');
const ticketList = document.getElementById('ticketList');
const ticketDetails = document.getElementById('ticketDetails');
const statusFilter = document.getElementById('statusFilter');
const currentUserName = document.getElementById('currentUserName');
const currentUserRole = document.getElementById('currentUserRole');

const workflow = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

let tickets = [];
let selectedTicketId = null;

initCurrentUser();
init();

ticketForm.addEventListener('submit', onSubmitTicket);
statusFilter.addEventListener('change', () => {
  refreshTickets();
});
currentUserName.addEventListener('input', onCurrentUserChange);
currentUserRole.addEventListener('change', onCurrentUserChange);

function initCurrentUser() {
  const saved = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null');
  currentUserName.value = saved?.name || 'Student User';
  currentUserRole.value = saved?.role || 'USER';
}

async function init() {
  await refreshTickets();
}

function onCurrentUserChange() {
  const user = getCurrentUser();
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  refreshTickets();
}

function getCurrentUser() {
  return {
    name: (currentUserName.value || 'Anonymous').trim(),
    role: currentUserRole.value,
  };
}

async function onSubmitTicket(event) {
  event.preventDefault();
  formMessage.textContent = '';

  const formData = new FormData(ticketForm);
  const files = document.getElementById('attachments').files;

  if (files.length > 3) {
    setFormMessage('Only up to 3 image attachments are allowed.', true);
    return;
  }

  const invalidFile = [...files].find((file) => !file.type.startsWith('image/'));
  if (invalidFile) {
    setFormMessage('All attachments must be image files.', true);
    return;
  }

  if (!ticketForm.checkValidity()) {
    setFormMessage('Please fill all required fields.', true);
    ticketForm.reportValidity();
    return;
  }

  const user = getCurrentUser();
  try {
    const createdTicket = await apiFetch(
      '/api/tickets',
      {
        method: 'POST',
        body: JSON.stringify({
          resourceLocation: String(formData.get('resourceLocation')).trim(),
          category: String(formData.get('category')),
          description: String(formData.get('description')).trim(),
          priority: String(formData.get('priority')),
          preferredContact: String(formData.get('preferredContact')).trim(),
          attachments: [...files].map((file) => ({
            fileName: file.name,
            contentType: file.type,
            sizeKb: Math.max(1, Math.round(file.size / 1024)),
          })),
        }),
      },
      user,
    );

    ticketForm.reset();
    document.getElementById('priority').value = 'MEDIUM';
    setFormMessage(`Ticket ${createdTicket.id} created successfully.`, false);
    selectedTicketId = createdTicket.id;
    await refreshTickets();
  } catch (error) {
    setFormMessage(error.message, true);
  }
}

function setFormMessage(message, isError) {
  formMessage.textContent = message;
  formMessage.className = isError ? 'form-message error' : 'form-message success';
}

function renderAll() {
  renderTicketList();
  renderTicketDetails();
}

function renderTicketList() {
  const filter = statusFilter.value;
  const visibleTickets = tickets.filter((ticket) =>
    filter === 'ALL' ? true : ticket.status === filter,
  );

  ticketList.innerHTML = '';

  if (visibleTickets.length === 0) {
    ticketList.innerHTML = '<li class="ticket-item muted">No tickets for selected filter.</li>';
    return;
  }

  visibleTickets.forEach((ticket) => {
    const item = document.createElement('li');
    item.className = `ticket-item ${ticket.id === selectedTicketId ? 'active' : ''}`;

    const createdAt = formatDate(ticket.createdAt);
    item.innerHTML = `
      <button class="ticket-select" type="button">
        <div class="ticket-top-row">
          <strong>${ticket.id}</strong>
          <span class="pill status-${ticket.status.toLowerCase()}">${ticket.status}</span>
        </div>
        <div class="ticket-meta">
          <span>${escapeHtml(ticket.resourceLocation)}</span>
          <span class="pill priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span>
        </div>
        <small class="muted">${createdAt} • by ${escapeHtml(ticket.createdBy)}</small>
      </button>
    `;

    item.querySelector('.ticket-select').addEventListener('click', () => {
      selectedTicketId = ticket.id;
      renderAll();
    });

    ticketList.appendChild(item);
  });
}

function renderTicketDetails() {
  const ticket = tickets.find((t) => t.id === selectedTicketId);

  if (!ticket) {
    ticketDetails.className = 'ticket-details empty-state';
    ticketDetails.textContent = 'Select a ticket to manage workflow, technician assignment, and comments.';
    return;
  }

  ticketDetails.className = 'ticket-details';
  const user = getCurrentUser();
  const nextStatus = getNextStatus(ticket.status);
  const canReject = user.role === 'ADMIN' && ticket.status !== 'REJECTED' && ticket.status !== 'CLOSED';
  const canManageTicket = user.role === 'ADMIN' || user.role === 'STAFF';
  const assignedTechnician = ticket.assignedTechnician ?? '';
  const resolutionNotes = ticket.resolutionNotes ?? '';
  const rejectionReason = ticket.rejectionReason ?? '';

  ticketDetails.innerHTML = `
    <div class="details-head">
      <div>
        <h3>${ticket.id}</h3>
        <p class="muted">Created ${formatDate(ticket.createdAt)} by ${escapeHtml(ticket.createdBy)}</p>
      </div>
      <span class="pill status-${ticket.status.toLowerCase()}">${ticket.status}</span>
    </div>

    <div class="details-grid">
      <p><strong>Resource/Location:</strong> ${escapeHtml(ticket.resourceLocation)}</p>
      <p><strong>Category:</strong> ${escapeHtml(ticket.category)}</p>
      <p><strong>Priority:</strong> <span class="pill priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span></p>
      <p><strong>Preferred Contact:</strong> ${escapeHtml(ticket.preferredContact)}</p>
    </div>

    <p><strong>Description:</strong> ${escapeHtml(ticket.description)}</p>

    <div class="attachments-block">
      <strong>Attachments (${ticket.attachments.length}/3)</strong>
      <ul>
        ${ticket.attachments.length
          ? ticket.attachments
              .map(
                (file) =>
                  `<li>${escapeHtml(file.fileName ?? file.name ?? 'Attachment')} (${file.sizeKb} KB)</li>`,
              )
              .join('')
          : '<li class="muted">No attachments.</li>'}
      </ul>
    </div>

    <div class="actions-grid">
      <label>
        Assigned Technician
        <input id="assignedTechnicianInput" type="text" value="${escapeHtml(assignedTechnician)}" placeholder="e.g. Nimesh Perera" ${canManageTicket ? '' : 'disabled'} />
      </label>
      <label>
        Resolution Notes
        <textarea id="resolutionNotesInput" rows="3" placeholder="Add fix summary..." ${canManageTicket ? '' : 'disabled'}>${escapeHtml(resolutionNotes)}</textarea>
      </label>
      <label>
        Rejection Reason (admin)
        <input id="rejectionReasonInput" type="text" value="${escapeHtml(rejectionReason)}" placeholder="Reason required when rejecting" ${canReject ? '' : 'disabled'} />
      </label>
      <div class="buttons-row">
        <button id="saveMetaBtn" type="button" ${canManageTicket ? '' : 'disabled'}>Save Assignment/Notes</button>
        <button id="advanceStatusBtn" type="button" ${nextStatus && canManageTicket ? '' : 'disabled'}>
          ${nextStatus ? `Move to ${nextStatus}` : 'No Next Status'}
        </button>
        <button id="rejectBtn" type="button" ${canReject ? '' : 'disabled'}>Reject Ticket</button>
      </div>
      <p id="detailsActionMessage" class="form-message"></p>
    </div>

    <section class="comments-section">
      <h4>Comments</h4>
      <form id="commentForm" class="comment-form">
        <textarea id="commentText" rows="2" required maxlength="300" placeholder="Add a comment..."></textarea>
        <button type="submit">Add Comment</button>
      </form>
      <ul id="commentsList" class="comments-list">
        ${renderCommentsHtml(ticket, user)}
      </ul>
    </section>
  `;

  bindDetailsActions(ticket.id, user);
}

function bindDetailsActions(ticketId, user) {
  const saveMetaBtn = document.getElementById('saveMetaBtn');
  const advanceStatusBtn = document.getElementById('advanceStatusBtn');
  const rejectBtn = document.getElementById('rejectBtn');
  const commentForm = document.getElementById('commentForm');
  const commentsList = document.getElementById('commentsList');
  const detailsActionMessage = document.getElementById('detailsActionMessage');

  const showDetailsMessage = (message, isError = false) => {
    if (!detailsActionMessage) return;
    detailsActionMessage.textContent = message;
    detailsActionMessage.className = isError ? 'form-message error' : 'form-message success';
  };

  saveMetaBtn?.addEventListener('click', async () => {
    try {
      await apiFetch(
        `/api/tickets/${ticketId}/assignment`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            assignedTechnician: document.getElementById('assignedTechnicianInput').value.trim(),
            resolutionNotes: document.getElementById('resolutionNotesInput').value.trim(),
          }),
        },
        user,
      );
      await refreshTickets(ticketId);
      showDetailsMessage('Assignment and resolution notes saved.');
    } catch (error) {
      showDetailsMessage(error.message, true);
    }
  });

  advanceStatusBtn?.addEventListener('click', async () => {
    const ticket = tickets.find((current) => current.id === ticketId);
    const next = ticket ? getNextStatus(ticket.status) : null;
    if (!next) return;

    try {
      await apiFetch(
        `/api/tickets/${ticketId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: next }),
        },
        user,
      );
      await refreshTickets(ticketId);
      showDetailsMessage(`Ticket moved to ${next}.`);
    } catch (error) {
      showDetailsMessage(error.message, true);
    }
  });

  rejectBtn?.addEventListener('click', async () => {
    const reason = document.getElementById('rejectionReasonInput').value.trim();
    if (!reason) {
      alert('Rejection reason is required.');
      return;
    }
    try {
      await apiFetch(
        `/api/tickets/${ticketId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'REJECTED', rejectionReason: reason }),
        },
        user,
      );
      await refreshTickets(ticketId);
      showDetailsMessage('Ticket rejected.');
    } catch (error) {
      showDetailsMessage(error.message, true);
    }
  });

  commentForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const textInput = document.getElementById('commentText');
    const text = textInput.value.trim();
    if (!text) return;

    try {
      await apiFetch(
        `/api/tickets/${ticketId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({ text }),
        },
        user,
      );
      await refreshTickets(ticketId);
    } catch (error) {
      alert(error.message);
    }
  });

  commentsList?.addEventListener('click', async (event) => {
    const actionButton = event.target.closest('button[data-action]');
    if (!actionButton) return;

    const { action, commentId } = actionButton.dataset;
    if (!commentId) return;

    if (action === 'delete') {
      try {
        await apiFetch(
          `/api/tickets/${ticketId}/comments/${commentId}`,
          { method: 'DELETE' },
          user,
        );
        await refreshTickets(ticketId);
      } catch (error) {
        alert(error.message);
      }
      return;
    }

    if (action === 'edit') {
      const ticket = tickets.find((current) => current.id === ticketId);
      const comment = ticket?.comments.find((current) => current.id === commentId);
      if (!comment || !canModifyComment(user, comment)) return;

      const updatedText = prompt('Edit comment', comment.text);
      if (updatedText === null) return;

      const cleaned = updatedText.trim();
      if (!cleaned) return;

      try {
        await apiFetch(
          `/api/tickets/${ticketId}/comments/${commentId}`,
          {
            method: 'PATCH',
            body: JSON.stringify({ text: cleaned }),
          },
          user,
        );
        await refreshTickets(ticketId);
      } catch (error) {
        alert(error.message);
      }
    }
  });
}

function renderCommentsHtml(ticket, user) {
  if (!ticket.comments.length) {
    return '<li class="muted">No comments yet.</li>';
  }

  return ticket.comments
    .map((comment) => {
      const canModify = canModifyComment(user, comment);
      const authorName = comment.authorName ?? comment.author ?? 'Unknown';
      const edited = Boolean(comment.updatedAt && comment.updatedAt !== comment.createdAt);
      return `
        <li class="comment-item">
          <div class="comment-head">
            <strong>${escapeHtml(authorName)}</strong>
            <small class="muted">${formatDate(comment.createdAt)}${edited ? ' • edited' : ''}</small>
          </div>
          <p>${escapeHtml(comment.text)}</p>
          <div class="comment-actions">
            <button type="button" data-action="edit" data-comment-id="${comment.id}" ${canModify ? '' : 'disabled'}>Edit</button>
            <button type="button" data-action="delete" data-comment-id="${comment.id}" ${canModify ? '' : 'disabled'}>Delete</button>
          </div>
        </li>
      `;
    })
    .join('');
}

function canModifyComment(user, comment) {
  const authorName = comment.authorName ?? comment.author;
  return user.role === 'ADMIN' || user.name === authorName;
}

function getNextStatus(status) {
  const index = workflow.indexOf(status);
  if (index === -1 || index === workflow.length - 1) {
    return null;
  }
  return workflow[index + 1];
}

async function refreshTickets(preferredTicketId = null) {
  const user = getCurrentUser();
  const selectedStatus = statusFilter.value;
  const query = new URLSearchParams();

  if (selectedStatus !== 'ALL') {
    query.set('status', selectedStatus);
  }
  if (user.role === 'USER') {
    query.set('mine', 'true');
  }

  try {
    const response = await apiFetch(`/api/tickets?${query.toString()}`, { method: 'GET' }, user);
    tickets = Array.isArray(response) ? response : [];

    const candidateId = preferredTicketId ?? selectedTicketId;
    const exists = candidateId && tickets.some((ticket) => ticket.id === candidateId);
    selectedTicketId = exists ? candidateId : (tickets[0]?.id ?? null);
    renderAll();
  } catch (error) {
    setFormMessage(error.message, true);
    tickets = [];
    selectedTicketId = null;
    renderAll();
  }
}

async function apiFetch(path, options, user) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Name': user.name,
      'X-User-Role': user.role,
      ...(options?.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
