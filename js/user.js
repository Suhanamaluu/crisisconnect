/* ===== USER DASHBOARD JS ===== */

// Request Form Handler
function initRequestForm() {
    const form = document.getElementById('request-form');
    const successMsg = document.getElementById('request-success');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const request = {
            id: 'REQ-' + Date.now(),
            name: document.getElementById('req-name').value.trim(),
            location: document.getElementById('req-location').value.trim(),
            resource: document.getElementById('req-resource').value,
            description: document.getElementById('req-description').value.trim(),
            status: 'pending',
            acceptedBy: null,
            timestamp: new Date().toISOString()
        };

        if (!request.name || !request.location || !request.resource) {
            Toast.show('Please fill in all required fields.', 'error');
            return;
        }

        const requests = JSON.parse(localStorage.getItem('cdrs_requests') || '[]');
        requests.push(request);
        localStorage.setItem('cdrs_requests', JSON.stringify(requests));

        form.reset();
        if (successMsg) {
            successMsg.classList.add('show');
            setTimeout(() => successMsg.classList.remove('show'), 4000);
        }
        Toast.show('Request submitted successfully!', 'success');
    });
}

// Grid Map - Pathfinding (BFS avoiding danger zones)
const MAP_SIZE = 15;
let mapGrid = [];

function loadMapData() {
    const data = localStorage.getItem('cdrs_map_data');
    if (data) {
        mapGrid = JSON.parse(data);
    } else {
        mapGrid = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill('safe'));
    }
}

function renderUserMap() {
    const container = document.getElementById('user-grid-map');
    if (!container) return;
    loadMapData();
    container.innerHTML = '';

    // Top-left corner (empty)
    const corner = document.createElement('div');
    corner.className = 'grid-label corner-label';
    container.appendChild(corner);

    // Column headers (1-15)
    for (let c = 0; c < MAP_SIZE; c++) {
        const label = document.createElement('div');
        label.className = 'grid-label col-label';
        label.textContent = c + 1;
        container.appendChild(label);
    }

    // Grid rows with row labels
    for (let r = 0; r < MAP_SIZE; r++) {
        // Row label
        const rowLabel = document.createElement('div');
        rowLabel.className = 'grid-label';
        rowLabel.textContent = r + 1;
        container.appendChild(rowLabel);

        for (let c = 0; c < MAP_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            const status = mapGrid[r][c];
            if (status === 'danger') cell.classList.add('danger');
            else if (status === 'moderate') cell.classList.add('moderate');
            container.appendChild(cell);
        }
    }
}

function findSafeRoute() {
    const startInput = document.getElementById('route-start').value.trim();
    const endInput = document.getElementById('route-end').value.trim();
    const warningEl = document.getElementById('route-warning');
    const infoEl = document.getElementById('route-info');

    warningEl.classList.remove('show');
    infoEl.classList.remove('show');

    if (!startInput || !endInput) {
        Toast.show('Please enter both starting point and destination.', 'error');
        return;
    }

    // Parse coordinates (format: row,col)
    const start = parseCoord(startInput);
    const end = parseCoord(endInput);

    if (!start || !end) {
        Toast.show('Use format: row,col (e.g., 0,0 for top-left)', 'warning');
        return;
    }

    if (!isValid(start[0], start[1]) || !isValid(end[0], end[1])) {
        Toast.show(`Coordinates must be between 0 and ${MAP_SIZE - 1}`, 'error');
        return;
    }

    loadMapData();

    // Clear previous path
    renderUserMap();

    // BFS pathfinding - avoid danger, prefer safe over moderate
    const path = bfsPathfind(start, end);

    const mapContainer = document.getElementById('user-grid-map');
    const cells = mapContainer.querySelectorAll('.grid-cell');

    if (!path) {
        warningEl.innerHTML = '⚠️ No safe path found! All routes are blocked by danger zones.';
        warningEl.classList.add('show');

        // Mark start and end
        getCell(cells, start[0], start[1]).classList.add('start');
        getCell(cells, end[0], end[1]).classList.add('end');
        return;
    }

    // Highlight path
    path.forEach(([r, c], i) => {
        const cell = getCell(cells, r, c);
        if (i === 0) cell.classList.add('start');
        else if (i === path.length - 1) cell.classList.add('end');
        else cell.classList.add('path');
    });

    infoEl.innerHTML = `✅ Safe route found! Path length: ${path.length} blocks.`;
    infoEl.classList.add('show');
}

function parseCoord(str) {
    const parts = str.split(',').map(s => parseInt(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts;
    return null;
}

function isValid(r, c) {
    return r >= 0 && r < MAP_SIZE && c >= 0 && c < MAP_SIZE;
}

function getCell(cells, r, c) {
    return cells[r * MAP_SIZE + c];
}

function bfsPathfind(start, end) {
    // Cost-aware BFS (Dijkstra-like): safe = 1, moderate = 3, danger = blocked
    const dist = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(Infinity));
    const prev = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(null));
    const visited = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(false));

    const [sr, sc] = start;
    const [er, ec] = end;

    if (mapGrid[sr][sc] === 'danger' || mapGrid[er][ec] === 'danger') return null;

    dist[sr][sc] = 0;
    // Simple priority queue using sorted array
    const queue = [[0, sr, sc]];

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (queue.length > 0) {
        queue.sort((a, b) => a[0] - b[0]);
        const [d, r, c] = queue.shift();

        if (visited[r][c]) continue;
        visited[r][c] = true;

        if (r === er && c === ec) {
            // Reconstruct path
            const path = [];
            let cr = er, cc = ec;
            while (cr !== null && cc !== null) {
                path.unshift([cr, cc]);
                const p = prev[cr][cc];
                if (!p) break;
                cr = p[0]; cc = p[1];
            }
            return path;
        }

        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (!isValid(nr, nc) || visited[nr][nc]) continue;
            const cell = mapGrid[nr][nc];
            if (cell === 'danger') continue;

            const cost = cell === 'moderate' ? 3 : 1;
            const newDist = d + cost;
            if (newDist < dist[nr][nc]) {
                dist[nr][nc] = newDist;
                prev[nr][nc] = [r, c];
                queue.push([newDist, nr, nc]);
            }
        }
    }

    return null;
}

// Camps Display
function renderUserCamps() {
    const container = document.getElementById('user-camps-grid');
    if (!container) return;

    const camps = JSON.parse(localStorage.getItem('cdrs_camps') || '[]');
    if (camps.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⛺</div>
        <p class="empty-state-text">No camps available yet</p>
      </div>`;
        return;
    }

    container.innerHTML = camps.map(camp => {
        const foodClass = camp.foodStock < 100 ? 'low' : 'ok';
        const bedClass = camp.bedsAvailable < 20 ? 'low' : 'ok';
        return `
    <div class="camp-card">
      <div class="camp-card-header">
        <h3>${camp.name}</h3>
        <span class="camp-code">${camp.code}</span>
        <div class="camp-location">📍 ${camp.location}</div>
      </div>
      <div class="camp-card-body">
        <div class="camp-stat-row">
          <span class="camp-stat-label">Total Capacity</span>
          <span class="camp-stat-value">${camp.totalCapacity}</span>
        </div>
        <div class="camp-stat-row">
          <span class="camp-stat-label">Available Beds</span>
          <span class="camp-stat-value ${bedClass}">${camp.bedsAvailable}</span>
        </div>
        <div class="camp-stat-row">
          <span class="camp-stat-label">Food Availability</span>
          <span class="camp-stat-value ${foodClass}">${camp.foodAvailability}</span>
        </div>
        <div class="camp-demographics">
          <div class="demo-item">
            <div class="demo-value">${camp.children}</div>
            <div class="demo-label">Children</div>
          </div>
          <div class="demo-item">
            <div class="demo-value">${camp.adults}</div>
            <div class="demo-label">Adults</div>
          </div>
          <div class="demo-item">
            <div class="demo-value">${camp.seniors}</div>
            <div class="demo-label">60+ Seniors</div>
          </div>
        </div>
      </div>
    </div>`;
    }).join('');
}

// Init user dashboard
document.addEventListener('DOMContentLoaded', () => {
    initRequestForm();
    renderUserMap();
    renderUserCamps();
});
