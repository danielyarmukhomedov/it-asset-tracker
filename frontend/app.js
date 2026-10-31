// ФАЙЛ: frontend/app.js
let allAssets = [];
let currentFilter = 'ALL';

async function loadAssets() {
  try {
    const res = await fetch('/api/assets');
    allAssets = await res.json();
    updateStats();
    renderTable();
  } catch (err) {
    console.error('Ошибка загрузки данных:', err);
  }
}

function updateStats() {
  document.getElementById('stat-total').textContent = allAssets.length;
  const maintCount = allAssets.filter(a => a.status === 'MAINTENANCE').length;
  document.getElementById('stat-maint').textContent = maintCount;
}

function renderTable() {
  const tbody = document.getElementById('ledger-body');
  const query = document.getElementById('search-box').value.trim().toUpperCase();
  tbody.textContent = '';

  const filtered = allAssets.filter(item => {
    const matchesStatus = currentFilter === 'ALL' || item.status === currentFilter;
    const matchesSearch = !query ||
      (item.tag && item.tag.toUpperCase().includes(query)) ||
      (item.serial && item.serial.toUpperCase().includes(query)) ||
      (item.model && item.model.toUpperCase().includes(query)) ||
      (item.ip && item.ip.toUpperCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  if (filtered.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'ЗАПИСИ НЕ НАЙДЕНЫ';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  filtered.forEach(item => {
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
}

document.querySelectorAll('[data-filter]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.getAttribute('data-filter');
    renderTable();
  });
});

document.getElementById('search-box').addEventListener('input', renderTable);
document.getElementById('refresh-btn').addEventListener('click', loadAssets);
window.addEventListener('DOMContentLoaded', loadAssets);
