// sidebar.js — builds and injects the sidebar + topbar
'use strict';

function buildAppShell(activePage, topbarTitle, topbarSub) {
  const user = Auth.getUser();
  if (!user) { window.location.href = 'login.html'; return; }

  const isAdmin = user.isAdmin;
  const initials = (user.fullName || user.username || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const flag = user.nationality === 'IN' ? '🇮🇳' : '🇳🇵';

  const navItems = isAdmin ? [
    { icon: '📊', label: 'Dashboard', page: 'admin', href: 'admin.html' },
    { icon: '🔔', label: 'Pending Transactions', page: 'pending', href: 'admin-transactions.html', badge: '3' },
    { icon: '📋', label: 'All Transactions', page: 'all-transactions', href: 'admin-all.html' },
    { icon: '👥', label: 'Users', page: 'users', href: 'admin-users.html' },
    { icon: '⚙️', label: 'Settings', page: 'settings', href: 'admin-settings.html' },
  ] : [
    { icon: '🏠', label: 'Dashboard', page: 'dashboard', href: 'dashboard.html' },
    { icon: '💰', label: 'Buy USD / Crypto', page: 'buy', href: 'buy.html' },
    { icon: '📤', label: 'Sell USD / Crypto', page: 'sell', href: 'sell.html' },
    { icon: '💳', label: 'Virtual Cards', page: 'virtual-card', href: 'virtual-card.html' },
    { icon: '📜', label: 'Transactions', page: 'transactions', href: 'transactions.html' },
    { icon: '👤', label: 'My Profile', page: 'profile', href: 'profile.html' },
  ];

  const navHTML = navItems.map(item => `
    <a href="${item.href}" class="nav-item${activePage === item.page ? ' active' : ''}" data-page="${item.page}">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
      ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
    </a>`).join('');

  const sidebar = `
    <aside class="sidebar" id="mainSidebar">
      <div class="sidebar-logo">
        <div class="logo-mark">N</div>
        <span class="logo-text">Nex<span>Vault</span></span>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-title">Navigation</div>
        ${navHTML}
        ${!isAdmin ? `
        <div class="nav-section-title" style="margin-top:16px;">Legal</div>
        <a href="terms.html" class="nav-item${activePage === 'terms' ? ' active' : ''}">
          <span class="nav-icon">📄</span><span>Terms of Service</span>
        </a>
        <a href="privacy.html" class="nav-item${activePage === 'privacy' ? ' active' : ''}">
          <span class="nav-icon">🔒</span><span>Privacy Policy</span>
        </a>` : ''}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user" onclick="window.location.href='${isAdmin ? '#' : 'profile.html'}'">
          <div class="user-avatar user-avatar-initials">${initials}</div>
          <div class="user-info">
            <div class="user-name sidebar-user-name">${user.fullName || user.username}</div>
            <div class="user-role sidebar-user-role">${flag} ${user.nationality === 'IN' ? 'Indian' : 'Nepali'}</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm btn-block" style="margin-top:8px;" onclick="Auth.logout()">
          🚪 Sign Out
        </button>
      </div>
    </aside>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>`;

  const kycBanner = user.kycStatus !== 'verified' ? `
    <div class="restricted-banner" style="margin:20px 28px 0;">
      <div class="restricted-icon">⚠️</div>
      <div class="restricted-text">
        <h3>KYC Verification Required</h3>
        <p>Complete your identity verification to unlock all trading features.</p>
      </div>
      <a href="kyc.html" class="btn btn-outline btn-sm" style="margin-left:auto;flex-shrink:0;">Verify Now</a>
    </div>` : '';

  const topbar = `
    <header class="topbar">
      <button class="topbar-menu-btn" id="menuBtn">☰</button>
      <div>
        <div class="topbar-title">${topbarTitle}</div>
        ${topbarSub ? `<div class="topbar-subtitle">${topbarSub}</div>` : ''}
      </div>
      <div class="topbar-right">
        <div class="icon-btn" title="Notifications">
          🔔
          <span class="notif-badge" id="notifBadge" style="display:none;">1</span>
        </div>
        <a href="${isAdmin ? '#' : 'profile.html'}" class="user-avatar user-avatar-initials" style="text-decoration:none;cursor:pointer;">${initials}</a>
      </div>
    </header>
    ${kycBanner}`;

  return { sidebar, topbar };
}

function initAppShell(activePage, title, subtitle) {
  const shell = buildAppShell(activePage, title, subtitle);
  if (!shell) return;

  const layout = document.getElementById('appLayout');
  if (!layout) return;

  const mainContent = layout.querySelector('.main-content');
  layout.insertAdjacentHTML('afterbegin', shell.sidebar);
  if (mainContent) mainContent.insertAdjacentHTML('afterbegin', shell.topbar);

  Sidebar.init();
}
