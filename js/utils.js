// ── NexVault Utility Library ─────────────────────────────
'use strict';

/* ── Toast ──────────────────────────────────────────────── */
const Toast = (() => {
  let container;
  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(type, title, message, duration = 4000) {
    const icons = { success: '✅', error: '❌', info: '💡', warning: '⚠️' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <div class="toast-icon">${icons[type] || '💬'}</div>
      <div class="toast-body">
        <p>${title}</p>
        <p>${message}</p>
      </div>
    `;
    getContainer().appendChild(el);
    setTimeout(() => {
      el.classList.add('hiding');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  return {
    success: (t, m, d) => show('success', t, m, d),
    error: (t, m, d) => show('error', t, m, d),
    info: (t, m, d) => show('info', t, m, d),
    warning: (t, m, d) => show('warning', t, m, d),
  };
})();

/* ── Modal ──────────────────────────────────────────────── */
const Modal = (() => {
  function open(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  }
  function close(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }
  function closeAll() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  }

  // Close on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.add('hidden');
    }
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  return { open, close, closeAll };
})();

/* ── Sidebar ─────────────────────────────────────────────── */
const Sidebar = (() => {
  function init() {
    const menuBtn = document.querySelector('.topbar-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (!sidebar) return;

    menuBtn?.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay?.classList.toggle('show');
    });

    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  function setActive(pageName) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === pageName) item.classList.add('active');
    });
  }

  return { init, setActive };
})();

/* ── Form Validation ─────────────────────────────────────── */
const Validator = (() => {
  const rules = {
    required: (v) => v.trim().length > 0 || 'This field is required',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address',
    phone: (v) => /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,8}$/.test(v) || 'Enter a valid phone number',
    minLen: (n) => (v) => v.length >= n || `Must be at least ${n} characters`,
    maxLen: (n) => (v) => v.length <= n || `Must be at most ${n} characters`,
    username: (v) => /^[a-zA-Z0-9_]{3,20}$/.test(v) || 'Username: 3-20 chars, letters/numbers/underscore only',
    password: (v) => {
      if (v.length < 8) return 'Password must be at least 8 characters';
      if (!/[A-Z]/.test(v)) return 'Include at least one uppercase letter';
      if (!/[0-9]/.test(v)) return 'Include at least one number';
      return true;
    },
    amount: (v) => (!isNaN(parseFloat(v)) && parseFloat(v) > 0) || 'Enter a valid amount',
  };

  function validate(input, ...appliedRules) {
    const value = input.value;
    for (const rule of appliedRules) {
      const result = rule(value);
      if (result !== true) {
        setError(input, result);
        return false;
      }
    }
    setSuccess(input);
    return true;
  }

  function setError(input, msg) {
    input.classList.add('error'); input.classList.remove('success');
    const errEl = input.closest('.form-group')?.querySelector('.form-error');
    if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
  }

  function setSuccess(input) {
    input.classList.remove('error'); input.classList.add('success');
    const errEl = input.closest('.form-group')?.querySelector('.form-error');
    if (errEl) errEl.classList.remove('visible');
  }

  function clearAll(form) {
    form.querySelectorAll('.form-control').forEach(i => {
      i.classList.remove('error', 'success');
    });
    form.querySelectorAll('.form-error').forEach(e => e.classList.remove('visible'));
  }

  return { rules, validate, setError, setSuccess, clearAll };
})();

/* ── Password Toggle ─────────────────────────────────────── */
function initPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isText = target.type === 'text';
      target.type = isText ? 'password' : 'text';
      btn.textContent = isText ? '👁️' : '🙈';
    });
  });
}

/* ── Password Strength ───────────────────────────────────── */
function initPasswordStrength(inputId, barId, textId) {
  const input = document.getElementById(inputId);
  const bar = document.getElementById(barId);
  const text = document.getElementById(textId);
  if (!input || !bar) return;

  input.addEventListener('input', () => {
    const v = input.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const classes = ['', 'weak', 'fair', 'good', 'strong'];
    const segs = bar.querySelectorAll('.strength-segment');
    segs.forEach((s, i) => {
      s.className = 'strength-segment';
      if (i < score) s.classList.add(classes[score]);
    });
    if (text) text.textContent = v ? labels[score] : '';
  });
}

/* ── File Upload ─────────────────────────────────────────── */
function initFileUpload(areaId, inputId, previewId) {
  const area = document.getElementById(areaId);
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!area || !input) return;

  area.addEventListener('click', () => input.click());
  area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('dragover'); });
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', (e) => {
    e.preventDefault(); area.classList.remove('dragover');
    if (e.dataTransfer.files[0]) showPreview(e.dataTransfer.files[0]);
  });
  input.addEventListener('change', () => {
    if (input.files[0]) showPreview(input.files[0]);
  });

  function showPreview(file) {
    if (!preview) return;
    const size = file.size > 1024*1024 ? `${(file.size/1024/1024).toFixed(1)} MB` : `${(file.size/1024).toFixed(0)} KB`;
    const ext = file.name.split('.').pop().toUpperCase();
    const icons = { PDF:'📄', JPG:'🖼️', JPEG:'🖼️', PNG:'🖼️' };
    preview.innerHTML = `
      <div class="file-preview">
        <span class="file-icon">${icons[ext] || '📎'}</span>
        <div>
          <div class="file-name">${file.name}</div>
          <div class="file-size">${size} · ${ext}</div>
        </div>
        <button class="remove-file" onclick="clearFile('${inputId}','${previewId}')">✕</button>
      </div>`;
    area.style.display = 'none';
  }
}

function clearFile(inputId, previewId) {
  document.getElementById(inputId).value = '';
  const preview = document.getElementById(previewId);
  if (preview) preview.innerHTML = '';
  const area = document.getElementById(inputId + '-area');
  if (area) area.style.display = '';
}

/* ── Pill selector ───────────────────────────────────────── */
function initPillGroup(groupId, callback) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      group.querySelectorAll('.pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      if (callback) callback(pill.dataset.value);
    });
  });
}

/* ── Tab switcher ────────────────────────────────────────── */
function initTabs(groupId, contentPrefix) {
  const tabs = document.querySelectorAll(`#${groupId} .tab-btn`);
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.querySelectorAll(`[data-tab-content]`).forEach(c => {
        c.classList.toggle('hidden', c.dataset.tabContent !== target);
      });
    });
  });
}

/* ── Auth state (mock) ───────────────────────────────────── */
const Auth = (() => {
  function getUser() {
    const raw = localStorage.getItem('nv_user');
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  function setUser(user) { localStorage.setItem('nv_user', JSON.stringify(user)); }
  function logout() { localStorage.removeItem('nv_user'); window.location.href = '../index.html'; }
  function requireAuth() {
    if (!getUser()) { window.location.href = '../pages/login.html'; return false; }
    return true;
  }
  function requireKYC() {
    const user = getUser();
    if (!user) { window.location.href = '../pages/login.html'; return false; }
    if (user.kycStatus !== 'verified') {
      window.location.href = '../pages/kyc.html'; return false;
    }
    return true;
  }
  return { getUser, setUser, logout, requireAuth, requireKYC };
})();

/* ── Format helpers ──────────────────────────────────────── */
const Format = {
  currency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  },
  number: (n) => new Intl.NumberFormat('en-US').format(n),
  date: (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  time: (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  txId: () => 'NV-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase(),
};

/* ── Exchange rates (mock live) ──────────────────────────── */
const Rates = {
  USD_NPR: 133.20,
  USD_INR: 83.45,
  BTC_USD: 67842.00,
  ETH_USD: 3521.00,
  USDT_USD: 1.00,

  convert(amount, from, to) {
    const pair = `${from}_${to}`;
    const pair2 = `${to}_${from}`;
    if (this[pair]) return amount * this[pair];
    if (this[pair2]) return amount / this[pair2];
    return amount;
  },

  getDisplay(from, to) {
    const pair = `${from}_${to}`;
    const pair2 = `${to}_${from}`;
    if (this[pair]) return `1 ${from} = ${this[pair].toFixed(2)} ${to}`;
    if (this[pair2]) return `1 ${to} = ${this[pair2].toFixed(2)} ${from}`;
    return '';
  }
};

/* ── Sidebar user info filler ────────────────────────────── */
function fillUserInfo() {
  const user = Auth.getUser();
  if (!user) return;
  document.querySelectorAll('.sidebar-user-name, .user-display-name').forEach(el => {
    el.textContent = user.fullName || user.username || 'User';
  });
  document.querySelectorAll('.sidebar-user-role').forEach(el => {
    el.textContent = user.nationality === 'IN' ? '🇮🇳 Indian' : '🇳🇵 Nepali';
  });
  document.querySelectorAll('.user-avatar-initials').forEach(el => {
    const name = user.fullName || user.username || 'U';
    el.textContent = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  });
}

/* ── DOM ready helper ────────────────────────────────────── */
function onReady(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}
