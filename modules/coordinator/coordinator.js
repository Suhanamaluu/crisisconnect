/* ===== COORDINATOR JS ===== */

// ---- AUTH ----
function initCoordinatorAuth() {
    const signupBtn = document.getElementById('auth-signup-btn');
    const loginBtn = document.getElementById('auth-login-btn');
    const signupOverlay = document.getElementById('signup-overlay');
    const loginOverlay = document.getElementById('login-overlay');

    if (signupBtn) signupBtn.addEventListener('click', () => signupOverlay.classList.add('active'));
    if (loginBtn) loginBtn.addEventListener('click', () => loginOverlay.classList.add('active'));

    // Close modals
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').classList.remove('active');
        });
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });

    // Signup
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const campCode = document.getElementById('signup-camp-code').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const phone = document.getElementById('signup-phone').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPass = document.getElementById('signup-confirm').value;

            if (!name || !campCode || !email || !phone || !password) {
                Toast.show('Please fill all fields.', 'error'); return;
            }
            if (password !== confirmPass) {
                Toast.show('Passwords do not match!', 'error'); return;
            }
            if (password.length < 4) {
                Toast.show('Password must be at least 4 characters.', 'error'); return;
            }

            const coordCode = String(Math.floor(100000 + Math.random() * 900000));
            const coordinator = { id: coordCode, name, campCode, email, phone, password };

            let coordinators;
            if (typeof DB !== 'undefined') {
                coordinators = await DB.getCoordinators();
            } else {
                coordinators = JSON.parse(localStorage.getItem('cdrs_coordinators') || '[]');
            }

            if (coordinators.find(c => c.email === email)) {
                Toast.show('Email already registered!', 'error'); return;
            }

            if (typeof DB !== 'undefined') {
                await DB.addCoordinator(coordinator);
            } else {
                coordinators.push(coordinator);
                localStorage.setItem('cdrs_coordinators', JSON.stringify(coordinators));
            }

            signupOverlay.classList.remove('active');
            signupForm.reset();

            // Show SMS simulation
            const smsEl = document.getElementById('sms-simulation');
            const smsCode = document.getElementById('sms-code');
            if (smsEl && smsCode) {
                smsCode.textContent = coordCode;
                smsEl.classList.add('show');
            }

            Toast.show('Account created! Use your Coordinator Code to login.', 'success');
        });
    }

    // Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = document.getElementById('login-code').value.trim();
            const password = document.getElementById('login-password').value;

            let coordinators;
            if (typeof DB !== 'undefined') {
                coordinators = await DB.getCoordinators();
            } else {
                coordinators = JSON.parse(localStorage.getItem('cdrs_coordinators') || '[]');
            }

            const coord = coordinators.find(c => c.id === code && c.password === password);

            if (!coord) {
                Toast.show('Invalid Coordinator Code or Password!', 'error'); return;
            }

            localStorage.setItem('cdrs_current_coordinator', JSON.stringify(coord));
            Toast.show('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'coordinator-dashboard.html';
            }, 800);
        });
    }
}

// ---- DASHBOARD ----
function checkCoordinatorAuth() {
    const coord = localStorage.getItem('cdrs_current_coordinator');
    if (!coord) {
        window.location.href = 'coordinator-auth.html';
        return null;
    }
    return JSON.parse(coord);
}

async function initCoordDashboard() {
    const coord = checkCoordinatorAuth();
    if (!coord) return;

    const welcomeEl = document.getElementById('coord-welcome');
    if (welcomeEl) welcomeEl.textContent = `Welcome, ${coord.name}`;

    await renderCoordCamps();
    await renderUserRequests();
    await renderResourceRequests();
    initResourceForm(coord);
    initCoordMap();
    initLogout();
}

// Camps Management
async function renderCoordCamps() {
    const container = document.getElementById('coord-camps-container');
    if (!container) return;

    let camps;
    if (typeof DB !== 'undefined') {
        camps = await DB.getCamps();
    } else {
        camps = JSON.parse(localStorage.getItem('cdrs_camps') || '[]');
    }

    if (camps.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⛺</div><p class="empty-state-text">No camps configured</p></div>';
        return;
    }

    container.innerHTML = camps.map((camp, idx) => `
    <div class="coord-camp-card" data-index="${idx}">
      <div class="coord-camp-card-header">
        <div>
          <h3>${camp.name}</h3>
          <span class="camp-code">${camp.code}</span>
        </div>
      </div>
      <div class="coord-camp-card-body" id="camp-body-${idx}">
        <div class="camp-edit-row"><span class="camp-edit-label">Total People</span><span class="camp-edit-value" data-field="totalCapacity">${camp.totalCapacity}</span></div>
        <div class="camp-edit-row"><span class="camp-edit-label">Children</span><span class="camp-edit-value" data-field="children">${camp.children}</span></div>
        <div class="camp-edit-row"><span class="camp-edit-label">Adults</span><span class="camp-edit-value" data-field="adults">${camp.adults}</span></div>
        <div class="camp-edit-row"><span class="camp-edit-label">60+ Seniors</span><span class="camp-edit-value" data-field="seniors">${camp.seniors}</span></div>
        <div class="camp-edit-row"><span class="camp-edit-label">Beds Available</span><span class="camp-edit-value" data-field="bedsAvailable">${camp.bedsAvailable}</span></div>
        <div class="camp-edit-row"><span class="camp-edit-label">Food Stock</span><span class="camp-edit-value" data-field="foodStock">${camp.foodStock}</span></div>
        <div class="camp-edit-row"><span class="camp-edit-label">Medicine Stock</span><span class="camp-edit-value" data-field="medicineStock">${camp.medicineStock}</span></div>
      </div>
      <div class="camp-card-actions">
        <button class="btn btn--primary btn--sm" onclick="editCamp(${idx})">✏️ Edit</button>
        <button class="btn btn--success btn--sm" onclick="saveCamp(${idx})" style="display:none;" id="save-btn-${idx}">💾 Save</button>
      </div>
    </div>
  `).join('');
}

function editCamp(idx) {
    const body = document.getElementById(`camp-body-${idx}`);
    const saveBtn = document.getElementById(`save-btn-${idx}`);
    const values = body.querySelectorAll('.camp-edit-value');

    values.forEach(v => {
        const current = v.textContent;
        const field = v.dataset.field;
        v.innerHTML = `<input class="camp-edit-input" type="number" value="${current}" data-field="${field}" min="0">`;
    });

    saveBtn.style.display = 'inline-flex';
}

async function saveCamp(idx) {
    const body = document.getElementById(`camp-body-${idx}`);
    const inputs = body.querySelectorAll('.camp-edit-input');

    let camps;
    if (typeof DB !== 'undefined') {
        camps = await DB.getCamps();
    } else {
        camps = JSON.parse(localStorage.getItem('cdrs_camps') || '[]');
    }

    inputs.forEach(input => {
        const field = input.dataset.field;
        camps[idx][field] = parseInt(input.value) || 0;
    });

    // Update food availability based on stock
    if (camps[idx].foodStock >= 300) camps[idx].foodAvailability = 'High';
    else if (camps[idx].foodStock >= 100) camps[idx].foodAvailability = 'Medium';
    else camps[idx].foodAvailability = 'Low';

    // Save to Supabase + localStorage
    if (typeof DB !== 'undefined') {
        await DB.updateCamp(camps[idx].id, camps[idx]);
    }
    localStorage.setItem('cdrs_camps', JSON.stringify(camps));

    Toast.show('Camp updated successfully!', 'success');
    await renderCoordCamps();
}

// User Requests
async function renderUserRequests() {
    const container = document.getElementById('user-requests-container');
    if (!container) return;

    let requests;
    if (typeof DB !== 'undefined') {
        requests = await DB.getRequests();
    } else {
        requests = JSON.parse(localStorage.getItem('cdrs_requests') || '[]');
    }

    if (requests.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p class="empty-state-text">No user requests yet</p></div>';
        return;
    }

    container.innerHTML = requests.map((req, idx) => {
        let statusHTML = '';
        if (req.status === 'accepted') {
            statusHTML = `<div class="request-status accepted">✅ Accepted by ${req.acceptedBy || 'Coordinator'}</div>`;
        } else if (req.status === 'rejected') {
            statusHTML = `<div class="request-status rejected">❌ Rejected</div>`;
        }

        const actionsHTML = req.status === 'pending' ? `
      <div class="request-card-actions">
        <button class="btn btn--success btn--sm" onclick="handleRequest(${idx}, 'accepted')">✅ Accept</button>
        <button class="btn btn--danger btn--sm" onclick="handleRequest(${idx}, 'rejected')">❌ Reject</button>
      </div>
    ` : '';

        return `
    <div class="request-card">
      <div class="request-card-header">
        <h3>${req.name}</h3>
        <span class="request-resource-badge">${req.resource}</span>
      </div>
      <div class="request-detail"><strong>📍 Location:</strong> ${req.location}</div>
      <div class="request-detail"><strong>📝 Description:</strong> ${req.description || 'N/A'}</div>
      <div class="request-detail"><strong>🕐 Time:</strong> ${new Date(req.timestamp).toLocaleString()}</div>
      ${statusHTML}
      ${actionsHTML}
    </div>`;
    }).join('');
}

async function handleRequest(idx, status) {
    let requests;
    if (typeof DB !== 'undefined') {
        requests = await DB.getRequests();
    } else {
        requests = JSON.parse(localStorage.getItem('cdrs_requests') || '[]');
    }

    const coord = JSON.parse(localStorage.getItem('cdrs_current_coordinator') || '{}');
    requests[idx].status = status;
    let acceptedBy = null;
    if (status === 'accepted') {
        acceptedBy = coord.name + ' (' + (coord.campCode || 'N/A') + ')';
        requests[idx].acceptedBy = acceptedBy;
    }

    // Save to Supabase + localStorage
    if (typeof DB !== 'undefined') {
        await DB.updateRequestStatus(requests[idx].id, status, acceptedBy);
    }
    localStorage.setItem('cdrs_requests', JSON.stringify(requests));

    Toast.show(`Request ${status}!`, status === 'accepted' ? 'success' : 'warning');
    await renderUserRequests();
}

// Resource Requests
function initResourceForm(coord) {
    const form = document.getElementById('resource-form');
    if (!form) return;

    const nameField = document.getElementById('res-coord-name');
    if (nameField) nameField.value = coord.name;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const resource = {
            id: 'RES-' + Date.now(),
            coordinatorName: document.getElementById('res-coord-name').value.trim(),
            resourceType: document.getElementById('res-type').value,
            quantity: document.getElementById('res-quantity').value.trim(),
            requiredBefore: document.getElementById('res-date').value,
            description: document.getElementById('res-description').value.trim(),
            timestamp: new Date().toISOString()
        };

        if (!resource.resourceType || !resource.quantity) {
            Toast.show('Please fill required fields.', 'error'); return;
        }

        if (typeof DB !== 'undefined') {
            await DB.addResourceRequest(resource);
        } else {
            const resources = JSON.parse(localStorage.getItem('cdrs_resource_requests') || '[]');
            resources.push(resource);
            localStorage.setItem('cdrs_resource_requests', JSON.stringify(resources));
        }

        form.reset();
        if (nameField) nameField.value = coord.name;
        Toast.show('Resource request submitted!', 'success');
        await renderResourceRequests();
    });
}

async function renderResourceRequests() {
    const container = document.getElementById('resource-list');
    if (!container) return;

    let resources;
    if (typeof DB !== 'undefined') {
        resources = await DB.getResourceRequests();
    } else {
        resources = JSON.parse(localStorage.getItem('cdrs_resource_requests') || '[]');
    }

    if (resources.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><p class="empty-state-text">No resource requests</p></div>';
        return;
    }

    container.innerHTML = resources.map(r => `
    <div class="resource-card">
      <div class="resource-info">
        <span class="resource-type">${r.resourceType} — Qty: ${r.quantity}</span>
        <span class="resource-meta">By ${r.coordinatorName} | Due: ${r.requiredBefore || 'ASAP'}</span>
        ${r.description ? `<span class="resource-meta">${r.description}</span>` : ''}
      </div>
    </div>
  `).join('');
}

// Coordinator Map
let coordMapTool = 'danger';
let coordGrid = [];

async function initCoordMap() {
    const container = document.getElementById('coord-grid-map');
    if (!container) return;

    if (typeof DB !== 'undefined') {
        coordGrid = await DB.getMapGrid();
    } else {
        coordGrid = MapModule.loadGrid();
    }

    MapModule.renderGrid('coord-grid-map', {
        clickable: true,
        onClick: async (r, c, cell) => {
            // Toggle cell status based on selected tool
            coordGrid[r][c] = coordMapTool;
            if (typeof DB !== 'undefined') {
                await DB.saveMapGrid(coordGrid);
            } else {
                MapModule.saveGrid(coordGrid);
            }
            // Update cell classes
            cell.className = 'grid-cell';
            if (coordMapTool === 'danger') cell.classList.add('danger');
            else if (coordMapTool === 'moderate') cell.classList.add('moderate');
            else if (coordMapTool === 'safe') cell.classList.add('safe');
        }
    });

    // Tool buttons
    document.querySelectorAll('.map-tool-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.map-tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            coordMapTool = btn.dataset.tool;

            if (coordMapTool === 'clear') {
                coordGrid = Array.from({ length: 15 }, () => Array(15).fill('safe'));
                if (typeof DB !== 'undefined') {
                    await DB.saveMapGrid(coordGrid);
                } else {
                    MapModule.saveGrid(coordGrid);
                }
                MapModule.renderGrid('coord-grid-map', {
                    clickable: true,
                    onClick: async (r, c, cell) => {
                        coordGrid[r][c] = coordMapTool === 'clear' ? 'safe' : coordMapTool;
                        if (typeof DB !== 'undefined') {
                            await DB.saveMapGrid(coordGrid);
                        } else {
                            MapModule.saveGrid(coordGrid);
                        }
                        cell.className = 'grid-cell';
                        cell.classList.add(coordGrid[r][c]);
                    }
                });
                Toast.show('Map cleared!', 'success');
            }
        });
    });
}

// Logout
function initLogout() {
    const logoutBtn = document.getElementById('coord-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('cdrs_current_coordinator');
            window.location.href = 'coordinator-auth.html';
        });
    }
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
    // Auth page
    if (document.getElementById('auth-signup-btn')) {
        initCoordinatorAuth();
    }
    // Dashboard page
    if (document.getElementById('coord-dashboard')) {
        await initCoordDashboard();
    }
});
