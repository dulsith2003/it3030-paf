const statusEl = document.getElementById('status');
const messageEl = document.getElementById('message');
const retryBtn = document.getElementById('retry');

async function checkMongo() {
  statusEl.textContent = 'Checking...';
  statusEl.className = 'status loading';
  messageEl.textContent = 'Connecting to backend...';

  try {
    const response = await fetch('/api/health/mongodb');
    const data = await response.json();

    if (response.ok && data.connected) {
      statusEl.textContent = 'Connected';
      statusEl.className = 'status ok';
      messageEl.textContent = data.message || 'MongoDB connected.';
      return;
    }

    statusEl.textContent = 'Not Connected';
    statusEl.className = 'status bad';
    messageEl.textContent = data.message || 'MongoDB not connected.';
  } catch (error) {
    statusEl.textContent = 'Not Connected';
    statusEl.className = 'status bad';
    messageEl.textContent = 'Backend unreachable: ' + error.message;
  }
}

window.addEventListener('DOMContentLoaded', checkMongo);
retryBtn.addEventListener('click', checkMongo);
