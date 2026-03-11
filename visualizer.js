/**
 * visualizer.js
 * Takes generated step arrays and sequentially draws them to the DOM / Canvas.
 * Connects the logic engine explicitly to UI playback features.
 */

class Visualizer {
    constructor() {
        this.steps = [];
        this.stepIndex = 0;
        this.timer = null;

        // Layers - using lazy initialization
        this._layerArray = null;
        this._layerMatrix = null;
        this._layerCanvas = null;
        this._ctx = null;
        this._layerTree = null;
        this._ctxTree = null;

        // Debug log
        console.log('[DEBUG] Visualizer constructor called');

        // Cards
        this.cardDivide = document.getElementById('state-divide');
        this.cardConquer = document.getElementById('state-conquer');
        this.cardCombine = document.getElementById('state-combine');

        // Binds
        this.startBtn = document.getElementById('btn-start');
        this.pauseBtn = document.getElementById('btn-pause');
        this.resetBtn = document.getElementById('btn-reset');
        this.speedSlider = document.getElementById('speed-slider');

        this.initListeners();
    }

    // Lazy getters for layers
    get layerArray() {
        if (!this._layerArray) {
            this._layerArray = document.getElementById('array-layer');
            console.log('[DEBUG] Lazy initialized layerArray:', this._layerArray !== null);
        }
        return this._layerArray;
    }
    get layerMatrix() {
        if (!this._layerMatrix) {
            this._layerMatrix = document.getElementById('matrix-layer');
            console.log('[DEBUG] Lazy initialized layerMatrix:', this._layerMatrix !== null);
        }
        return this._layerMatrix;
    }
    get layerCanvas() {
        if (!this._layerCanvas) {
            this._layerCanvas = document.getElementById('canvas-layer');
            console.log('[DEBUG] Lazy initialized layerCanvas:', this._layerCanvas !== null);
        }
        return this._layerCanvas;
    }
    get ctx() {
        if (!this._ctx && this.layerCanvas) {
            this._ctx = this.layerCanvas.getContext('2d');
            console.log('[DEBUG] Lazy initialized ctx:', this._ctx !== null);
        }
        return this._ctx;
    }
    get layerTree() {
        if (!this._layerTree) {
            this._layerTree = document.getElementById('tree-canvas');
        }
        return this._layerTree;
    }
    get ctxTree() {
        if (!this._ctxTree && this.layerTree) {
            this._ctxTree = this.layerTree.getContext('2d');
        }
        return this._ctxTree;
    }

    initListeners() {
        if (this.startBtn) this.startBtn.addEventListener('click', () => this.start());
        if (this.pauseBtn) this.pauseBtn.addEventListener('click', () => this.pause());
        if (this.resetBtn) this.resetBtn.addEventListener('click', () => this.reset(true));

        if (this.speedSlider) {
            this.speedSlider.addEventListener('input', () => {
                if (this.timer) {
                    this.pause();
                    this.start(); // restart with new timing interval
                }
            });
        }
    }

    prepareLayer(algoKey, inputMode) {
        console.log('[DEBUG] prepareLayer called with:', algoKey, inputMode);

        // Clear steps when switching algorithms - force regeneration
        this.steps = [];
        this.stepIndex = 0;
        console.log('[DEBUG] Steps cleared for algorithm switch');

        this.reset(false);

        // Reset all layers to none first
        if (this.layerArray) {
            const prevDisplay = this.layerArray.style.display;
            this.layerArray.style.display = 'none';
            console.log('[DEBUG] layerArray display: ' + prevDisplay + ' -> none');
        }
        if (this.layerMatrix) {
            const prevDisplay = this.layerMatrix.style.display;
            this.layerMatrix.style.display = 'none';
            console.log('[DEBUG] layerMatrix display: ' + prevDisplay + ' -> none');
        }
        if (this.layerCanvas) {
            const prevDisplay = this.layerCanvas.style.display;
            this.layerCanvas.style.display = 'none';
            console.log('[DEBUG] layerCanvas display: ' + prevDisplay + ' -> none');
        }

        if (inputMode === 'array') {
            console.log('[DEBUG] Setting array-layer to flex');
            if (this.layerArray) this.layerArray.style.display = 'flex';
        } else if (algoKey.includes('matrix') || algoKey.includes('strassen')) {
            console.log('[DEBUG] Setting matrix-layer to flex');
            if (this.layerMatrix) this.layerMatrix.style.display = 'flex';
        } else {
            console.log('[DEBUG] Setting canvas-layer to block');
            if (this.layerCanvas) this.layerCanvas.style.display = 'block';
            this.resizeCanvas();
        }
    }

    resizeCanvas() {
        // Fit canvas dynamically
        if (this.layerCanvas && this.layerCanvas.parentElement) {
            const containerWidth = this.layerCanvas.parentElement.clientWidth;
            const containerHeight = this.layerCanvas.parentElement.clientHeight;
            // Use explicit dimensions if set, otherwise use container
            this.layerCanvas.width = this.layerCanvas.width > 0 ? this.layerCanvas.width : (containerWidth > 0 ? containerWidth : 800);
            this.layerCanvas.height = this.layerCanvas.height > 0 ? this.layerCanvas.height : (containerHeight > 0 ? containerHeight : 350);
        }

        if (this.layerTree && this.layerTree.parentElement) {
            const treeWidth = this.layerTree.parentElement.clientWidth;
            const treeHeight = this.layerTree.parentElement.clientHeight;
            this.layerTree.width = treeWidth > 0 ? treeWidth : 800;
            this.layerTree.height = treeHeight > 0 ? treeHeight : 250;
        }
    }

    reset(clearData = true) {
        this.pause();
        this.stepIndex = 0;

        ['divide', 'conquer', 'combine'].forEach(phase => {
            const card = document.getElementById(`state-${phase}`);
            if (card) {
                card.className = 'state-card';
                if (card.firstElementChild) card.firstElementChild.textContent = "Wait";
            }
        });

        if (clearData) {
            if (this.layerArray) this.layerArray.innerHTML = '';
            if (this.layerMatrix) this.layerMatrix.innerHTML = '';
            if (this.ctx && this.layerCanvas) this.ctx.clearRect(0, 0, this.layerCanvas.width, this.layerCanvas.height);
            if (this.ctxTree && this.layerTree) this.ctxTree.clearRect(0, 0, this.layerTree.width, this.layerTree.height);
        }

        // Clear active pseudocode
        document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active-line'));

        if (this.startBtn) this.startBtn.disabled = false;
        if (this.pauseBtn) this.pauseBtn.disabled = true;
    }

    start() {
        console.log('[DEBUG] Start button clicked');
        if (!window.appState || !window.appState.getAlgo()) return alert("Please select an algorithm from the sidebar first.");

        if (this.steps.length === 0 || this.stepIndex >= this.steps.length) {
            // Need to generate data
            this.generateData();
            if (this.steps.length === 0) return;
            this.stepIndex = 0; // reset for fresh run
        }

        if (this.startBtn) this.startBtn.disabled = true;
        if (this.pauseBtn) this.pauseBtn.disabled = false;

        // Ensure canvas is properly sized before starting
        this.resizeCanvas();

        // Map speed strictly 1 -> 2000ms, 20 -> 100ms
        const speedVal = parseInt(this.speedSlider.value || 10);
        const intervalMs = 2100 - (speedVal * 100);

        this.timer = setInterval(() => this.tick(), intervalMs);
        this.tick(); // immediately execute first frame natively
    }

    pause() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        if (this.startBtn) this.startBtn.disabled = false;
        if (this.pauseBtn) this.pauseBtn.disabled = true;
    }

    generateData() {
        console.log('[DEBUG] generateData called');
        if (!window.appState || !window.algorithms) {
            console.log('[DEBUG] Missing appState or algorithms');
            return;
        }
        const algo = window.appState.getAlgo();
        const rawInput = window.appState.getInput();
        console.log('[DEBUG] Algo:', algo, 'Input:', rawInput);

        try {
            if (algo === 'merge-sort' || algo === 'quick-sort' || algo === 'min-max' || algo === 'max-subarray') {
                const arr = rawInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                console.log('[DEBUG] Parsed array:', arr);
                if (arr.length === 0) throw "Invalid array input.";

                if (algo === 'merge-sort') this.steps = window.algorithms.genMergeSort(arr);
                else if (algo === 'quick-sort') this.steps = window.algorithms.genQuickSort(arr);
                else if (algo === 'min-max') this.steps = window.algorithms.genMinMax(arr);
                else if (algo === 'max-subarray') this.steps = window.algorithms.genMaxSubarray(arr);

            } else if (algo === 'matrix-mult' || algo === 'strassen') {
                let n = parseInt(rawInput);
                if (isNaN(n) || n < 1) n = 2;
                n = Math.pow(2, Math.ceil(Math.log2(n))); // Enforce power of 2 locally
                const inputField = document.getElementById('data-input');
                if (inputField) inputField.value = n; // auto-correct UI field

                if (algo === 'matrix-mult') this.steps = window.algorithms.genMatrixMult(n);
                else if (algo === 'strassen') this.steps = window.algorithms.genStrassen(n);

            } else if (algo === 'closest-pair' || algo === 'convex-hull') {
                let p = parseInt(rawInput);
                if (isNaN(p) || p < 3) p = 10;
                const inputField = document.getElementById('data-input');
                if (inputField) inputField.value = p;

                if (algo === 'closest-pair') this.steps = window.algorithms.genClosestPair(p);
                else if (algo === 'convex-hull') this.steps = window.algorithms.genConvexHull(p);
            }
            console.log('[DEBUG] Generated', this.steps.length, 'steps');
        } catch (e) {
            alert(e);
            this.steps = [];
        }
    }

    tick() {
        if (this.stepIndex >= this.steps.length) {
            this.pause();
            if (this.startBtn) this.startBtn.disabled = false;
            return;
        }

        const step = this.steps[this.stepIndex];

        // Update Message Cards
        ['divide', 'conquer', 'combine'].forEach(phase => {
            const card = document.getElementById(`state-${phase}`);
            if (card) card.className = 'state-card';
        });

        if (step.phase === 'finish') {
            if (this.cardCombine) {
                this.cardCombine.classList.add('highlight-combine');
                if (this.cardCombine.firstElementChild) this.cardCombine.firstElementChild.textContent = step.msg;
            }
        } else {
            const el = document.getElementById(`state-${step.phase}`);
            if (el) {
                el.classList.add(`highlight-${step.phase}`);
                if (el.firstElementChild) el.firstElementChild.textContent = step.msg;
            }
        }

        // Highlight active code line
        if (step.line !== undefined) {
            document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active-line'));
            const activeLineEl = document.getElementById(`pseudo-line-${step.line}`);
            if (activeLineEl) activeLineEl.classList.add('active-line');
        }

        // Draw Recursion Tree Frame
        if (step.treeNodes && this.layerTree && this.ctxTree) {
            this.drawTree(step.treeNodes);
        }

        // Render Frame
        console.log('[DEBUG] Drawing step type:', step.type, 'Expected: matrix/geometry');
        if (step.type === 'array') this.drawArray(step);
        else if (step.type === 'matrix') {
            console.log('[DEBUG] Calling drawMatrix for matrix step');
            this.drawMatrix(step);
        }
        else if (step.type === 'geometry') {
            console.log('[DEBUG] Calling drawGeometry for geometry step');
            this.drawGeometry(step);
        }

        this.stepIndex++;
    }

    // --- DOM / Canvas Rendering Utilities ---

    drawArray(step) {
        console.log('[DEBUG] drawArray called with step:', step);
        if (!this.layerArray) {
            console.log('[DEBUG] layerArray is null!');
            return;
        }
        const computedStyle = window.getComputedStyle(this.layerArray);
        console.log('[DEBUG] layerArray display - inline:', this.layerArray.style.display, 'computed:', computedStyle.display);
        this.layerArray.innerHTML = '';

        // Calculate max value for height scaling
        const maxVal = Math.max(...step.arr);
        const minVal = Math.min(...step.arr);
        const range = maxVal - minVal || 1;

        step.arr.forEach((val, i) => {
            const div = document.createElement('div');
            let clsStr = `array-box`;
            if (step.end) clsStr += ' hl-sorted';
            if (step.hl[i]) clsStr += ` ${step.hl[i]}`;

            div.className = clsStr;
            // Scale height proportionally (min 10%, max 100%)
            const heightPercent = 10 + ((val - minVal) / range) * 90;
            div.style.height = heightPercent + '%';
            div.textContent = val;
            this.layerArray.appendChild(div);
        });
        console.log('[DEBUG] Drew', step.arr.length, 'array elements');
        console.log('[DEBUG] layerArray display after:', this.layerArray.style.display);
    }

    drawMatrix(step) {
        console.log('[DEBUG] drawMatrix called with step:', step);
        if (!this.layerMatrix) {
            console.log('[DEBUG] layerMatrix is null!');
            return;
        }
        const computedStyle = window.getComputedStyle(this.layerMatrix);
        console.log('[DEBUG] layerMatrix display - inline:', this.layerMatrix.style.display, 'computed:', computedStyle.display);
        this.layerMatrix.innerHTML = '';

        const buildGrid = (mat, labelStr, hlMap) => {
            const wrap = document.createElement('div');
            wrap.style.display = 'flex'; wrap.style.flexDirection = 'column'; wrap.style.alignItems = 'center'; wrap.style.gap = '5px';

            const label = document.createElement('strong');
            label.textContent = labelStr;
            wrap.appendChild(label);

            const grid = document.createElement('div');
            grid.className = 'matrix-grid';
            grid.style.gridTemplateColumns = `repeat(${mat[0].length}, 1fr)`;

            for (let r = 0; r < mat.length; r++) {
                for (let c = 0; c < mat[0].length; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'matrix-cell';
                    if (hlMap[`${r},${c}`]) cell.classList.add(hlMap[`${r},${c}`]);
                    cell.textContent = mat[r][c];
                    grid.appendChild(cell);
                }
            }
            wrap.appendChild(grid);
            return wrap;
        };

        this.layerMatrix.appendChild(buildGrid(step.A, 'Matrix A', step.hlA));

        const mul = document.createElement('div'); mul.textContent = '×'; mul.style.fontSize = '24px';
        this.layerMatrix.appendChild(mul);

        this.layerMatrix.appendChild(buildGrid(step.B, 'Matrix B', step.hlB));

        const eq = document.createElement('div'); eq.textContent = '='; eq.style.fontSize = '24px';
        this.layerMatrix.appendChild(eq);

        if (step.C) this.layerMatrix.appendChild(buildGrid(step.C, 'Matrix C Result', step.hlC));
    }

    drawGeometry(step) {
        console.log('[DEBUG] drawGeometry called with step:', step);
        if (!this.layerCanvas || !this.ctx) {
            console.log('[DEBUG] layerCanvas or ctx is null! canvas:', this.layerCanvas, 'ctx:', this.ctx);
            return;
        }
        const computedStyle = window.getComputedStyle(this.layerCanvas);
        console.log('[DEBUG] layerCanvas display - inline:', this.layerCanvas.style.display, 'computed:', computedStyle.display);
        this.resizeCanvas(); // Ensure accurate dimensions dynamically
        this.ctx.clearRect(0, 0, this.layerCanvas.width, this.layerCanvas.height);

        // Scale factor to fit points in canvas (algorithm uses 30-570 for x, 30-270 for y)
        const scaleX = this.layerCanvas.width / 600;
        const scaleY = this.layerCanvas.height / 300;
        const scale = Math.min(scaleX, scaleY) * 0.85; // 85% of available space
        const offsetX = (this.layerCanvas.width - 570 * scale) / 2;
        const offsetY = (this.layerCanvas.height - 270 * scale) / 2;

        const toCanvasX = (x) => (x - 30) * scale + offsetX;
        const toCanvasY = (y) => (y - 30) * scale + offsetY;

        // Draw hull polygon explicitly natively
        if (step.hull && step.hull.length > 0) {
            this.ctx.fillStyle = 'rgba(40, 167, 69, 0.2)'; // combine green
            this.ctx.strokeStyle = '#28a745';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(toCanvasX(step.hull[0].x), toCanvasY(step.hull[0].y));
            for (let i = 1; i < step.hull.length; i++) this.ctx.lineTo(toCanvasX(step.hull[i].x), toCanvasY(step.hull[i].y));
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }

        // Draw dividing strip
        if (step.strip) {
            this.ctx.fillStyle = 'rgba(255, 193, 7, 0.15)'; // divide yellow
            this.ctx.fillRect(toCanvasX(step.strip.minX), 0, toCanvasX(step.strip.maxX) - toCanvasX(step.strip.minX), this.layerCanvas.height);
        }

        // Draw explicit vertical divider line constraint
        if (step.divider) {
            this.ctx.strokeStyle = '#ffc107';
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(toCanvasX(step.divider), 0);
            this.ctx.lineTo(toCanvasX(step.divider), this.layerCanvas.height);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw any explicit connections
        if (step.lines) {
            this.ctx.lineWidth = 2;
            step.lines.forEach(l => {
                this.ctx.strokeStyle = l.color || '#6c757d';
                this.ctx.beginPath();
                this.ctx.moveTo(toCanvasX(l.p1.x), toCanvasY(l.p1.y));
                this.ctx.lineTo(toCanvasX(l.p2.x), toCanvasY(l.p2.y));
                this.ctx.stroke();
            });
        }

        // Render point datasets
        step.points.forEach(p => {
            if (document.body.classList.contains('dark-theme')) this.ctx.fillStyle = '#f8f9fa';
            else this.ctx.fillStyle = '#343a40';

            if (step.hlPts && step.hlPts.includes(p)) this.ctx.fillStyle = '#dc3545'; // conquer red
            if (step.hull && step.hull.includes(p)) this.ctx.fillStyle = '#28a745'; // combine green
            if (step.closest && step.closest.includes(p)) this.ctx.fillStyle = '#007bff'; // final blue explicitly mapped

            this.ctx.beginPath();
            this.ctx.arc(toCanvasX(p.x), toCanvasY(p.y), step.hull && step.hull.includes(p) ? 6 : 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawTree(nodes) {
        if (!this.ctxTree || !this.layerTree) return;
        this.resizeCanvas();
        this.ctxTree.clearRect(0, 0, this.layerTree.width, this.layerTree.height);

        if (!nodes || nodes.length === 0) return;

        // Group by level to calculate horizontal spacing
        const levels = {};
        let maxLevel = 0;
        nodes.forEach(n => {
            if (!levels[n.level]) levels[n.level] = [];
            levels[n.level].push(n);
            if (n.level > maxLevel) maxLevel = n.level;
        });

        const vSpacing = this.layerTree.height / (maxLevel + 2);

        // Assign X and Y coordinates to nodes
        for (let l = 0; l <= maxLevel; l++) {
            if (!levels[l]) continue;
            const count = levels[l].length;
            const hSpacing = this.layerTree.width / (count + 1);
            levels[l].forEach((n, i) => {
                n.renderX = hSpacing * (i + 1);
                n.renderY = vSpacing * (l + 1);
            });
        }

        // Draw edges (Parent -> Child)
        this.ctxTree.strokeStyle = '#8d99ae';
        this.ctxTree.lineWidth = 1.5;
        nodes.forEach(n => {
            if (n.parent !== null) {
                const parent = nodes.find(p => p.id === n.parent);
                if (parent && parent.renderX !== undefined) {
                    this.ctxTree.beginPath();
                    this.ctxTree.moveTo(n.renderX, n.renderY);
                    this.ctxTree.lineTo(parent.renderX, parent.renderY);
                    this.ctxTree.stroke();
                }
            }
        });

        // Draw nodes
        nodes.forEach(n => {
            this.ctxTree.beginPath();
            this.ctxTree.arc(n.renderX, n.renderY, 18, 0, 2 * Math.PI);

            // Color based on algorithmic state
            if (n.state === 'divide') this.ctxTree.fillStyle = '#ffc107';
            else if (n.state === 'conquer') this.ctxTree.fillStyle = '#dc3545';
            else if (n.state === 'combine') this.ctxTree.fillStyle = '#28a745';
            else this.ctxTree.fillStyle = '#4361ee';

            this.ctxTree.fill();
            this.ctxTree.strokeStyle = document.body.classList.contains('dark-theme') ? '#1e1e1e' : '#fff';
            this.ctxTree.lineWidth = 2;
            this.ctxTree.stroke();

            // Label text inside node
            this.ctxTree.fillStyle = n.state === 'divide' ? '#000' : '#ffffff';
            this.ctxTree.font = 'bold 11px Inter';
            this.ctxTree.textAlign = 'center';
            this.ctxTree.textBaseline = 'middle';
            this.ctxTree.fillText(n.label, n.renderX, n.renderY);
        });
    }
}

// Bootstrap
window.visualizer = new Visualizer();
