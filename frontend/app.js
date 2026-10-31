async function loadAssets() {
  const tbody = document.getElementById('ledger-body');
  tbody.textContent = '';
  try {
    const res = await fetch('/api/assets');
    const data = await res.json();
    if (data.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 6;
      td.textContent = 'НЕТ ДАННЫХ В РЕЕСТРЕ';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    data.forEach(item => {
      const tr = document.createElement('tr');
      ['tag', 'serial', 'model', 'category', 'ip', 'status'].forEach(key => {
        const td = document.createElement('td');
        td.textContent = item[key] || '—';
        if (key === 'status' && item[key] === 'MAINTENANCE') {
          td.className = 'badge-critical';
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Ошибка загрузки данных:', err);
  }
}

document.getElementById('refresh-btn').addEventListener('click', loadAssets);
window.addEventListener('DOMContentLoaded', loadAssets);
