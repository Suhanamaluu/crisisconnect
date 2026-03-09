/* ===== MAP MODULE ===== */
// Shared map utilities for both user and coordinator

const MapModule = {
    SIZE: 15,

    loadGrid() {
        const data = localStorage.getItem('cdrs_map_data');
        if (data) return JSON.parse(data);
        return Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill('safe'));
    },

    saveGrid(grid) {
        localStorage.setItem('cdrs_map_data', JSON.stringify(grid));
    },

    renderGrid(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const grid = this.loadGrid();
        container.innerHTML = '';

        // Top-left corner (empty)
        const corner = document.createElement('div');
        corner.className = 'grid-label corner-label';
        container.appendChild(corner);

        // Column headers (1-15)
        for (let c = 0; c < this.SIZE; c++) {
            const label = document.createElement('div');
            label.className = 'grid-label col-label';
            label.textContent = c + 1;
            container.appendChild(label);
        }

        // Grid rows with row labels
        for (let r = 0; r < this.SIZE; r++) {
            // Row label
            const rowLabel = document.createElement('div');
            rowLabel.className = 'grid-label';
            rowLabel.textContent = r + 1;
            container.appendChild(rowLabel);

            for (let c = 0; c < this.SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                const status = grid[r][c];
                if (status === 'danger') cell.classList.add('danger');
                else if (status === 'moderate') cell.classList.add('moderate');
                else if (status === 'safe') cell.classList.add('safe');

                if (options.clickable && options.onClick) {
                    cell.addEventListener('click', () => options.onClick(r, c, cell));
                }
                container.appendChild(cell);
            }
        }
        return grid;
    },

    updateCell(grid, row, col, status) {
        if (row >= 0 && row < this.SIZE && col >= 0 && col < this.SIZE) {
            grid[row][col] = status;
            this.saveGrid(grid);
        }
    }
};
