const STORE_KEY = 'module-c-tickets-v1';
const USER_KEY = 'module-c-current-user-v1';

const ticketForm = document.getElementById('ticketForm');
const formMessage = document.getElementById('formMessage');
const ticketList = document.getElementById('ticketList');
const ticketDetails = document.getElementById('ticketDetails');
const statusFilter = document.getElementById('statusFilter');
const currentUserName = document.getElementById('currentUserName');
const currentUserRole = document.getElementById('currentUserRole');

const workflow = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

let tickets = loadTickets();
let selectedTicketId = tickets[0]?.id ?? null;

initCurrentUser();
renderAll();

ticketForm.addEventListener('submit', onSubmitTicket);
statusFilter.addEventListener('change', renderTicketList);
currentUserName.addEventListener('input', onCurrentUserChange);
currentUserRole.addEventListener('change', onCurrentUserChange);

function initCurrentUser() {
  const saved = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null');
  currentUserName.value = saved?.name || 'Student User';
  currentUserRole.value = saved?.role || 'USER';
}

function onCurrentUserChange() {
  const user = getCurrentUser();
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  renderTicketDetails();
}

function getCurrentUser() {
  return {
    name: (currentUserName.value || 'Anonymous').trim(),
    role: currentUserRole.value,
  };
}

function onSubmitTicket(event) {
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
  const now = new Date().toISOString();

  const newTicket = {
    id: `T-${Date.now().toString().slice(-6)}`,
    createdAt: now,
    updatedAt: now,
    createdBy: user.name,
    resourceLocation: String(formData.get('resourceLocation')).trim(),
    category: String(formData.get('category')),
    description: String(formData.get('description')).trim(),
    priority: String(formData.get('priority')),
    preferredContact: String(formData.get('preferredContact')).trim(),
    status: 'OPEN',
    rejectionReason: '',
    resolutionNotes: '',
    assignedTechnician: '',
    attachments: [...files].map((file) => ({
      name: file.name,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      type: file.type,
    })),
    comments: [],
  };

  tickets = [newTicket, ...tickets];
  selectedTicketId = newTicket.id;
  persistTickets();
  ticketForm.reset();
  document.getElementById('priority').value = 'MEDIUM';
  setFormMessage(`Ticket ${newTicket.id} created successfully.`, false);
  renderAll();
}

function setFormMessage(message, isError) {
  formMessage.textContent = message;
  formMessage.className = isError ? 'form-message error' : 'form-message success';
}

function loadTickets() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

function persistTickets() {
  localStorage.setItem(STORE_KEY, JSON.stringify(tickets));
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
                  `<li>${escapeHtml(file.name)} (${file.sizeKb} KB)</li>`,
              )
              .join('')
          : '<li class="muted">No attachments.</li>'}
      </ul>
    </div>

    <div class="actions-grid">
      <label>
        Assigned Technician
        <input id="assignedTechnicianInput" type="text" value="${escapeHtml(ticket.assignedTechnician)}" placeholder="e.g. Nimesh Perera" ${canManageTicket ? '' : 'disabled'} />
      </label>
      <label>
        Resolution Notes
        <textarea id="resolutionNotesInput" rows="3" placeholder="Add fix summary..." ${canManageTicket ? '' : 'disabled'}>${escapeHtml(ticket.resolutionNotes)}</textarea>
      </label>
      <label>
        Rejection Reason (admin)
        <input id="rejectionReasonInput" type="text" value="${escapeHtml(ticket.rejectionReason)}" placeholder="Reason required when rejecting" ${canReject ? '' : 'disabled'} />
      </label>
      <div class="buttons-row">
        <button id="saveMetaBtn" type="button" ${canManageTicket ? '' : 'disabled'}>Save Assignment/Notes</button>
        <button id="advanceStatusBtn" type="button" ${nextStatus && canManageTicket ? '' : 'disabled'}>
          ${nextStatus ? `Move to ${nextStatus}` : 'No Next Status'}
        </button>
        <button id="rejectBtn" type="button" ${canReject ? '' : 'disabled'}>Reject Ticket</button>
      </div>
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

  saveMetaBtn?.addEventListener('click', () => {
    updateTicket(ticketId, (ticket) => {
      ticket.assignedTechnician = document.getElementById('assignedTechnicianInput').value.trim();
      ticket.resolutionNotes = document.getElementById('resolutionNotesInput').value.trim();
      ticket.updatedAt = new Date().toISOString();
    });
  });

  advanceStatusBtn?.addEventListener('click', () => {
    updateTicket(ticketId, (ticket) => {
      const next = getNextStatus(ticket.status);
      if (!next) return;
      ticket.status = next;
      ticket.updatedAt = new Date().toISOString();
    });
  });

  rejectBtn?.addEventListener('click', () => {
    const reason = document.getElementById('rejectionReasonInput').value.trim();
    if (!reason) {
      alert('Rejection reason is required.');
      return;
    }
    updateTicket(ticketId, (ticket) => {
      ticket.status = 'REJECTED';
      ticket.rejectionReason = reason;
      ticket.updatedAt = new Date().toISOString();
    });
  });

  commentForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const textInput = document.getElementById('commentText');
    const text = textInput.value.trim();
    if (!text) return;

    updateTicket(ticketId, (ticket) => {
      ticket.comments.push({
        id: `C-${Date.now().toString().slice(-7)}`,
        text,
        author: user.name,
        role: user.role,
        createdAt: new Date().toISOString(),
      });
      ticket.updatedAt = new Date().toISOString();
    });
  });

  commentsList?.addEventListener('click', (event) => {
    const actionButton = event.target.closest('button[data-action]');
    if (!actionButton) return;

    const { action, commentId } = actionButton.dataset;
    if (!commentId) return;

    if (action === 'delete') {
      updateTicket(ticketId, (ticket) => {
        const comment = ticket.comments.find((item) => item.id === commentId);
        if (!comment || !canModifyComment(user, comment)) return;
        ticket.comments = ticket.comments.filter((item) => item.id !== commentId);
        ticket.updatedAt = new Date().toISOString();
      });
      return;
    }

    if (action === 'edit') {
      updateTicket(ticketId, (ticket) => {
        const comment = ticket.comments.find((item) => item.id === commentId);
        if (!comment || !canModifyComment(user, comment)) return;

        const updatedText = prompt('Edit comment', comment.text);
        if (updatedText === null) return;

        const cleaned = updatedText.trim();
        if (!cleaned) return;

        comment.text = cleaned;
        comment.editedAt = new Date().toISOString();
        ticket.updatedAt = new Date().toISOString();
      });
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
      return `
        <li class="comment-item">
          <div class="comment-head">
            <strong>${escapeHtml(comment.author)}</strong>
            <small class="muted">${formatDate(comment.createdAt)}${comment.editedAt ? ' • edited' : ''}</small>
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
  return user.role === 'ADMIN' || user.name === comment.author;
}

function getNextStatus(status) {
  const index = workflow.indexOf(status);
  if (index === -1 || index === workflow.length - 1) {
    return null;
  }
  return workflow[index + 1];
}

function updateTicket(ticketId, updater) {
  tickets = tickets.map((ticket) => {
    if (ticket.id !== ticketId) return ticket;

    const clone = structuredClone(ticket);
    updater(clone);
    return clone;
  });

  persistTickets();
  renderAll();
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
