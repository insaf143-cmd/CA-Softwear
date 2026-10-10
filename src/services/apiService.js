// Central LAN / Network Database Service for Multi-User Real-time Sync

export async function fetchCentralDatabase() {
  try {
    const res = await fetch('/api/database');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('Central database server unreachable, falling back to local cache:', err.message);
    return null;
  }
}

export async function saveCentralDatabase(data) {
  try {
    const res = await fetch('/api/database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to sync to central database server:', err.message);
    return null;
  }
}

export async function checkDatabaseStatus() {
  try {
    const res = await fetch('/api/database/status');
    if (!res.ok) return { connected: false };
    return await res.json();
  } catch {
    return { connected: false };
  }
}
