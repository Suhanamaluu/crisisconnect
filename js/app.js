/* ===== CRISIS CONNECT - MAIN APP JS ===== */

// Toast notification system
const Toast = {
  container: null,
  init() {
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  },
  show(message, type = 'success', duration = 4000) {
    if (!this.container) this.init();
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    const icons = { success: '✅', error: '❌', warning: '⚠️' };
    toast.innerHTML = `
      <span>${icons[type] || '📢'}</span>
      <span>${message}</span>
      <span class="toast-close" onclick="this.parentElement.remove()">×</span>
    `;
    this.container.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, duration);
  }
};

// Tab navigation
function initTabs() {
  const navLinks = document.querySelectorAll('.page-nav-link[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      navLinks.forEach(l => l.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      link.classList.add('active');
      const target = document.getElementById(tab);
      if (target) target.classList.add('active');
      // Close mobile menu
      const nav = document.querySelector('.page-nav');
      if (nav) nav.classList.remove('open');
    });
  });
}

// Mobile menu toggle
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.page-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }
}

// Seed sample data if none exists
function seedData() {
  if (!localStorage.getItem('cdrs_camps')) {
    const camps = [
      {
        id: 'CAMP001', name: 'City Relief Center', code: 'CRC-2026',
        location: 'Block A, Sector 12', totalCapacity: 500, bedsAvailable: 120,
        foodAvailability: 'High', children: 85, adults: 280, seniors: 15,
        foodStock: 450, medicineStock: 200
      },
      {
        id: 'CAMP002', name: 'Green Valley Shelter', code: 'GVS-2026',
        location: 'Highway 7, Green Valley', totalCapacity: 300, bedsAvailable: 45,
        foodAvailability: 'Medium', children: 60, adults: 175, seniors: 20,
        foodStock: 180, medicineStock: 90
      },
      {
        id: 'CAMP003', name: 'East Side Camp', code: 'ESC-2026',
        location: 'East Bridge Road', totalCapacity: 200, bedsAvailable: 8,
        foodAvailability: 'Low', children: 42, adults: 140, seniors: 10,
        foodStock: 60, medicineStock: 30
      }
    ];
    localStorage.setItem('cdrs_camps', JSON.stringify(camps));
  }

  if (!localStorage.getItem('cdrs_map_data')) {
    // Create 15x15 grid - mostly safe with some danger zones
    const grid = [];
    for (let i = 0; i < 15; i++) {
      grid[i] = [];
      for (let j = 0; j < 15; j++) {
        grid[i][j] = 'safe';
      }
    }
    // Add some initial danger/moderate zones
    const dangerCells = [[3,5],[3,6],[4,5],[4,6],[4,7],[7,10],[7,11],[8,10],[8,11],[9,10]];
    const moderateCells = [[2,5],[2,6],[5,5],[5,6],[5,7],[3,4],[3,7],[6,10],[6,11],[7,9],[9,11],[10,10]];
    dangerCells.forEach(([r,c]) => { if (grid[r] && grid[r][c] !== undefined) grid[r][c] = 'danger'; });
    moderateCells.forEach(([r,c]) => { if (grid[r] && grid[r][c] !== undefined) grid[r][c] = 'moderate'; });
    localStorage.setItem('cdrs_map_data', JSON.stringify(grid));
  }

  if (!localStorage.getItem('cdrs_requests')) {
    localStorage.setItem('cdrs_requests', JSON.stringify([]));
  }
  if (!localStorage.getItem('cdrs_resource_requests')) {
    localStorage.setItem('cdrs_resource_requests', JSON.stringify([]));
  }
  if (!localStorage.getItem('cdrs_coordinators')) {
    localStorage.setItem('cdrs_coordinators', JSON.stringify([]));
  }
}

// Landing page stats animation
function animateStats() {
  const camps = JSON.parse(localStorage.getItem('cdrs_camps') || '[]');
  const requests = JSON.parse(localStorage.getItem('cdrs_requests') || '[]');
  const statCamps = document.getElementById('stat-camps');
  const statRequests = document.getElementById('stat-requests');
  const statRoutes = document.getElementById('stat-routes');
  if (statCamps) animateNumber(statCamps, camps.length);
  if (statRequests) animateNumber(statRequests, requests.length);
  if (statRoutes) animateNumber(statRoutes, 12);
}

function animateNumber(el, target) {
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(interval); }
    el.textContent = current;
  }, 40);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  seedData();
  initTabs();
  initMobileMenu();
  // Landing page specific
  if (document.getElementById('hero-section')) {
    animateStats();
  }
});
