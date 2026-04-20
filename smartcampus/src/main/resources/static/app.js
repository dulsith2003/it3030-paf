const statusBadge = document.getElementById('statusBadge');
const statusMessage = document.getElementById('statusMessage');
const retryButton = document.getElementById('retryButton');

async function checkMongoStatus() {
  statusBadge.textContent = 'Checking...';
  statusBadge.className = 'badge loading';
  statusMessage.textContent = 'Connecting to backend health endpoint...';

  try {
    const response = await fetch('/api/health/mongodb', { method: 'GET' });
    const data = await response.json();

    if (response.ok && data.connected) {
      statusBadge.textContent = 'Connected';
      statusBadge.className = 'badge connected';
      statusMessage.textContent = data.message || 'MongoDB is connected.';
      return;
    }

    statusBadge.textContent = 'Not Connected';
    statusBadge.className = 'badge failed';
    statusMessage.textContent = data.message || 'MongoDB is not connected.';
  } catch (error) {
    statusBadge.textContent = 'Not Connected';
    statusBadge.className = 'badge failed';
    statusMessage.textContent = 'Could not call backend: ' + error.message;
  }
}

retryButton.addEventListener('click', checkMongoStatus);
window.addEventListener('DOMContentLoaded', checkMongoStatus);
