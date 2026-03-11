// Elements
const arrayInput = document.getElementById('array-input');
const algoSelect = document.getElementById('algo-select');
const runBtn = document.getElementById('run-btn');
const visPanel = document.getElementById('vis-panel');
const timeVal = document.getElementById('time-val');
const recVal = document.getElementById('rec-val');

const stepDivide = document.getElementById('step-divide');
const descDivide = document.getElementById('desc-divide');
const stepConquer = document.getElementById('step-conquer');
const descConquer = document.getElementById('desc-conquer');
const stepCombine = document.getElementById('step-combine');
const descCombine = document.getElementById('desc-combine');

// State
let steps = [];
let currentInterval = null;

// Algorithm Info Data
const algoInfo = {
    'merge-sort': { time: 'O(n log n)', rec: 'T(n) = 2T(n/2) + O(n)' },
    'quick-sort': { time: 'O(n log n) Expected', rec: 'T(n) = 2T(n/2) + O(n)' },
    'min-max': { time: 'O(n)', rec: 'T(n) = 2T(n/2) + O(1)' },
    'max-subarray': { time: 'O(n log n)', rec: 'T(n) = 2T(n/2) + O(n)' },
    'matrix-mult': { time: 'O(n^3)', rec: 'T(n) = 8T(n/2) + O(n^2)' },
    'strassen': { time: 'O(n^2.81)', rec: 'T(n) = 7T(n/2) + O(n^2)' },
    'closest-pair': { time: 'O(n log n)', rec: 'T(n) = 2T(n/2) + O(n)' },
    'convex-hull': { time: 'O(n log n) Expected', rec: 'T(n) = 2T(n/2) + O(n)' }
};

// --- Core Visualizer Engine ---

function parseInput() {
    return arrayInput.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
}

function renderArray(arr, highlights = {}, defaultClass = '') {
    visPanel.innerHTML = '';
    arr.forEach((val, i) => {
        const div = document.createElement('div');
        div.className = `array-box ${defaultClass}`;
        if (highlights[i]) div.classList.add(highlights[i]);
        div.textContent = val;
        visPanel.appendChild(div);
    });
}

function renderMatrixElement(mat, title, hl = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'matrix-wrapper';
    
    const label = document.createElement('div');
    label.className = 'matrix-label';
    label.textContent = title;
    wrap.appendChild(label);
    
    const grid = document.createElement('div');
    grid.className = 'matrix-grid';
    grid.style.gridTemplateColumns = `repeat(${mat[0].length}, 1fr)`;
    
    for (let r = 0; r < mat.length; r++) {
        for (let c = 0; c < mat[0].length; c++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            const k = `${r},${c}`;
            if (hl[k]) cell.classList.add(hl[k]);
            cell.textContent = mat[r][c];
            grid.appendChild(cell);
        }
    }
    wrap.appendChild(grid);
    return wrap;
}

function renderMatrices(A, B, C, hlA = {}, hlB = {}, hlC = {}) {
    const p = document.getElementById('matrix-panel');
    p.innerHTML = '';
    
    const c = document.createElement('div');
    c.className = 'matrix-container';
    
    c.appendChild(renderMatrixElement(A, 'A', hlA));
    
    const mul = document.createElement('div');
    mul.textContent = '×';
    mul.style.fontSize = '30px';
    c.appendChild(mul);
    
    c.appendChild(renderMatrixElement(B, 'B', hlB));
    
    const eq = document.createElement('div');
    eq.textContent = '=';
    eq.style.fontSize = '30px';
    c.appendChild(eq);
    
    if (C) c.appendChild(renderMatrixElement(C, 'C', hlC));
    
    p.appendChild(c);
}

function renderGeometry(step) {
    const canvas = document.getElementById('geometry-canvas');
    canvas.width = canvas.parentElement.clientWidth || 800; // fit panel
    canvas.height = 300; // fixed height
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw hull polygon
    if (step.hull && step.hull.length > 0) {
        ctx.fillStyle = 'rgba(40, 167, 69, 0.2)'; // combine green
        ctx.strokeStyle = '#28a745';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(step.hull[0].x, step.hull[0].y);
        for(let i=1; i<step.hull.length; i++) ctx.lineTo(step.hull[i].x, step.hull[i].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    // Draw strip
    if (step.strip) {
        ctx.fillStyle = 'rgba(255, 193, 7, 0.15)'; // divide yellow
        ctx.fillRect(step.strip.minX, 0, step.strip.maxX - step.strip.minX, canvas.height);
    }
    
    // Draw divider
    if (step.divider) {
        ctx.strokeStyle = '#ffc107';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(step.divider, 0);
        ctx.lineTo(step.divider, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Connect lines
    if (step.lines) {
        ctx.lineWidth = 2;
        step.lines.forEach(l => {
            ctx.strokeStyle = l.color || '#6c757d';
            ctx.beginPath();
            ctx.moveTo(l.p1.x, l.p1.y);
            ctx.lineTo(l.p2.x, l.p2.y);
            ctx.stroke();
        });
    }

    // Draw Points
    step.points.forEach(p => {
        ctx.fillStyle = '#343a40';
        
        if (step.hlPts && step.hlPts.includes(p)) ctx.fillStyle = '#dc3545'; // conquer red
        if (step.hull && step.hull.includes(p)) ctx.fillStyle = '#28a745'; // combine green
        if (step.closest && step.closest.includes(p)) ctx.fillStyle = '#007bff'; // final blue
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, step.hull && step.hull.includes(p) ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function clearCards() {
    [stepDivide, stepConquer, stepCombine].forEach(el => {
        el.className = 'step-card'; // reset classes
    });
}

function updateInfoPanel(algo) {
    const info = algoInfo[algo];
    timeVal.textContent = info.time;
    recVal.textContent = info.rec;
}

function updateCard(phase, message) {
    clearCards();
    if (phase === 'divide') {
        stepDivide.classList.add('card-divide-active');
        descDivide.textContent = message;
    } else if (phase === 'conquer') {
        stepConquer.classList.add('card-conquer-active');
        descConquer.textContent = message;
    } else if (phase === 'combine') {
        stepCombine.classList.add('card-combine-active');
        descCombine.textContent = message;
    } else if (phase === 'finish') {
        descDivide.textContent = 'Done';
        descConquer.textContent = 'Done';
        descCombine.textContent = message;
    }
}

function runVisualization() {
    if (currentInterval) clearInterval(currentInterval);
    runBtn.disabled = true;
    
    const arr = parseInput();
    if (arr.length === 0) {
        alert("Please enter a valid array of numbers.");
        runBtn.disabled = false;
        return;
    }

    const algo = algoSelect.value;
    updateInfoPanel(algo);
    
    // reset 
    steps = [];
    descDivide.textContent = "Waiting...";
    descConquer.textContent = "Waiting...";
    descCombine.textContent = "Waiting...";
    clearCards();
    
    // Toggle active panel
    document.getElementById('array-panel').style.display = 'none';
    document.getElementById('matrix-panel').style.display = 'none';
    document.getElementById('geometry-canvas').style.display = 'none';
    
    // initial state
    steps.push({ arr: [...arr], highlights: {}, phase: 'divide', msg: "Starting algorithm..." });

    // Generate Steps
    if (algo === 'merge-sort' || algo === 'quick-sort' || algo === 'min-max' || algo === 'max-subarray') {
        document.getElementById('array-panel').style.display = 'flex';
        steps.push({ type: 'array', arr: [...arr], highlights: {}, phase: 'divide', msg: "Starting algorithm..." });
        
        if (algo === 'merge-sort') {
            genMergeSort(arr, 0, arr.length - 1);
            steps.push({ type: 'array', arr: [...arr], highlights: {}, phase: 'finish', msg: "Array is sorted!", end: true });
        } else if (algo === 'quick-sort') {
            genQuickSort(arr, 0, arr.length - 1);
            steps.push({ type: 'array', arr: [...arr], highlights: {}, phase: 'finish', msg: "Array is sorted!", end: true });
        } else if (algo === 'min-max') {
            let res = genMinMax(arr, 0, arr.length - 1);
            steps.push({ type: 'array', arr: [...arr], highlights: {}, phase: 'finish', msg: `Finished! Min is ${res.min}, Max is ${res.max}`, end: true });
        } else if (algo === 'max-subarray') {
            let res = genMaxSubarray(arr, 0, arr.length - 1);
            let finalHl = {};
            for(let i = res.low; i <= res.high; i++) finalHl[i] = 'hl-combine';
            steps.push({ type: 'array', arr: [...arr], highlights: finalHl, phase: 'finish', msg: `Finished! Maximum Subarray sum is ${res.sum} (index ${res.low} to ${res.high})`, end: true });
        }
    } else if (algo === 'matrix-mult' || algo === 'strassen') {
        document.getElementById('matrix-panel').style.display = 'flex';
        let n = parseInt(arrayInput.value);
        if (isNaN(n) || n < 1) n = 2;
        n = Math.pow(2, Math.ceil(Math.log2(n))); // nearest power of 2
        arrayInput.value = n; // auto-correct display
        
        let A = Array(n).fill(0).map(() => Array(n).fill(0).map(() => Math.floor(Math.random()*9)+1));
        let B = Array(n).fill(0).map(() => Array(n).fill(0).map(() => Math.floor(Math.random()*9)+1));
        let C = Array(n).fill(0).map(() => Array(n).fill(0));
        
        steps.push({ type: 'matrix', A: cloneMat(A), B: cloneMat(B), C: cloneMat(C), hlA:{}, hlB:{}, hlC:{}, phase: 'divide', msg: `Generated ${n}x${n} Matrices A and B.` });
        
        if (algo === 'matrix-mult') {
            genMatrixMult(A, B, C, n, 0, 0, 0, 0, 0, 0);
            steps.push({ type: 'matrix', A, B, C, hlA:{}, hlB:{}, hlC: getMatHl(0,n,0,n,'hl-sorted'), phase: 'finish', msg: "Matrix Multiplication Complete!", end: true });
        } else {
            let CRes = genStrassen(A, B);
            steps.push({ type: 'matrix', A, B, C: CRes, hlA:{}, hlB:{}, hlC: getMatHl(0,n,0,n,'hl-sorted'), phase: 'finish', msg: "Strassen's Multiplication Complete!", end: true });
        }
    } else if (algo === 'closest-pair' || algo === 'convex-hull') {
        document.getElementById('geometry-canvas').style.display = 'block';
        let numPts = parseInt(arrayInput.value);
        if (isNaN(numPts) || numPts < 3) numPts = 10;
        arrayInput.value = numPts;
        
        let pts = [];
        const w = 800, h = 300, pad = 30;
        for(let i=0; i<numPts; i++) {
            pts.push({ id: i, x: Math.floor(Math.random()*(w - pad*2) + pad), y: Math.floor(Math.random()*(h - pad*2) + pad) });
        }
        
        if (algo === 'closest-pair') {
            pts.sort((a,b) => a.x - b.x); // Pre-sort by X natively for the alg
            steps.push({ type: 'geometry', points: [...pts], phase: 'divide', msg: `Generated ${numPts} points and pre-sorted by X-coordinate.` });
            
            genClosestPair(pts, [...pts]);
            
            // Last step grabs the final closest array pushed
            let finalStep = steps[steps.length-1];
            steps.push({ type: 'geometry', points: [...pts], closest: finalStep.closest, phase: 'finish', msg: `Closest pair strictly found with minimum distance!`, end: true });
        } else {
            steps.push({ type: 'geometry', points: [...pts], hull: [], phase: 'divide', msg: `Generated ${numPts} unstructured random points.` });
            
            let minX = pts[0], maxX = pts[0];
            for(let p of pts) {
                if (p.x < minX.x) minX = p;
                if (p.x > maxX.x) maxX = p;
            }
            let hullStrct = [minX, maxX];
            
            steps.push({ type: 'geometry', points: [...pts], hull: [...hullStrct], lines: [{p1:minX, p2:maxX, color: '#ffc107'}], phase: 'divide', msg: `Found Extremum bounds on X scale. Dividing sets natively into 2 domains...` });
            
            let s1 = [], s2 = [];
            for (let p of pts) {
                if (p === minX || p === maxX) continue;
                if (crossProd(minX, maxX, p) > 0) s1.push(p);
                else if (crossProd(maxX, minX, p) > 0) s2.push(p);
            }
            
            genConvexHull(s1, pts, minX, maxX, hullStrct);
            genConvexHull(s2, pts, maxX, minX, hullStrct);
            
            // Re-sort the final hull array topologically around centroid so it renders as a proper contiguous polygon loop
            let cx = 0, cy = 0;
            hullStrct.forEach(p => { cx+=p.x; cy+=p.y; });
            cx/=hullStrct.length; cy/=hullStrct.length;
            hullStrct.sort((a,b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
            
            steps.push({ type: 'geometry', points: [...pts], hull: hullStrct, phase: 'finish', msg: `Constructed Convex boundaries encompassing ${hullStrct.length} nodes!`, end: true });
        }
    }

    // Play Steps
    let stepIdx = 0;
    currentInterval = setInterval(() => {
        if (stepIdx >= steps.length) {
            clearInterval(currentInterval);
            runBtn.disabled = false;
            return;
        }

        const step = steps[stepIdx];
        if (step.type === 'array') {
            renderArray(step.arr, step.highlights, step.end ? 'hl-sorted' : '');
        } else if (step.type === 'matrix') {
            renderMatrices(step.A, step.B, step.C, step.hlA, step.hlB, step.hlC);
        } else if (step.type === 'geometry') {
            renderGeometry(step);
        }
        updateCard(step.phase, step.msg);
        
        stepIdx++;
    }, 1200); // 1.2s delay between steps for very clear observation
}

// --- Algorithm Generator Implementations ---
// Note: These mutate the array inline and push state snapshots to `steps` array

// 1. Merge Sort
function genMergeSort(arr, l, r) {
    if (l >= r) return;
    
    let mid = Math.floor((l + r) / 2);
    
    let hl = {};
    for(let i=l; i<=r; i++) hl[i] = 'hl-divide';
    hl[mid] = 'hl-active';
    steps.push({
        arr: [...arr], highlights: hl, phase: 'divide',
        msg: `Dividing array from index ${l} to ${r} at mid=${mid}`
    });

    genMergeSort(arr, l, mid);
    genMergeSort(arr, mid + 1, r);
    
    merge(arr, l, mid, r);
}

function merge(arr, l, mid, r) {
    let hl = {};
    for(let i=l; i<=r; i++) hl[i] = 'hl-conquer';
    steps.push({
        arr: [...arr], highlights: hl, phase: 'conquer',
        msg: `Conquering by merging left (${l}-${mid}) and right (${mid+1}-${r})`
    });

    let n1 = mid - l + 1;
    let n2 = r - mid;
    let L = new Array(n1), R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = arr[l + i];
    for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) { arr[k] = L[i]; i++; } 
        else { arr[k] = R[j]; j++; }
        k++;
    }
    while (i < n1) { arr[k] = L[i]; i++; k++; }
    while (j < n2) { arr[k] = R[j]; j++; k++; }

    let hlC = {};
    for(let x=l; x<=r; x++) hlC[x] = 'hl-combine';
    steps.push({
        arr: [...arr], highlights: hlC, phase: 'combine',
        msg: `Combined sorted ranges into sub-array [${l}...${r}]`
    });
}

// 2. Quick Sort
function genQuickSort(arr, low, high) {
    if (low < high) {
        let pi = partition(arr, low, high);
        
        genQuickSort(arr, low, pi - 1);
        genQuickSort(arr, pi + 1, high);
    }
}

function partition(arr, low, high) {
    let pivot = arr[high];
    
    let hl = {};
    for(let i=low; i<=high; i++) hl[i] = 'hl-divide';
    hl[high] = 'hl-active'; // Pivot
    
    steps.push({
        arr: [...arr], highlights: hl, phase: 'divide',
        msg: `Divide: Chose pivot ${pivot} at index ${high}. Partitioning range [${low}...${high}]`
    });

    let i = (low - 1);
    for (let j = low; j <= high - 1; j++) {
        steps.push({
            arr: [...arr], 
            highlights: {...hl, [j]: 'hl-conquer', [i >= low ? i : low]: 'hl-conquer'}, 
            phase: 'conquer',
            msg: `Conquer: Checking if ${arr[j]} is smaller than pivot ${pivot}`
        });

        if (arr[j] < pivot) {
            i++;
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            
            let swapHl = {};
            swapHl[i] = 'hl-combine'; swapHl[j] = 'hl-combine'; swapHl[high] = 'hl-active';
            steps.push({
                arr: [...arr], highlights: swapHl, phase: 'combine',
                msg: `Combine (Swap): Swapped ${arr[i]} and ${arr[j]} into left partition.`
            });
        }
    }
    
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    
    let endHl = {};
    endHl[i+1] = 'hl-sorted';
    steps.push({
        arr: [...arr], highlights: endHl, phase: 'combine',
        msg: `Combine (Pivot): Placed pivot ${pivot} securely at final index ${i+1}.`
    });

    return (i + 1);
}

// 3. Min & Max Finding 
function genMinMax(arr, low, high) {
    let hl = {};
    for(let i=low; i<=high; i++) hl[i] = 'hl-divide';
    
    steps.push({
        arr: [...arr], highlights: hl, phase: 'divide',
        msg: `Divide: Examining subarray range [${low}...${high}]`
    });

    if (low === high) {
        return { min: arr[low], max: arr[low] };
    }

    if (high === low + 1) {
        let hlC = { [low]: 'hl-conquer', [high]: 'hl-conquer' };
        steps.push({
            arr: [...arr], highlights: hlC, phase: 'conquer',
            msg: `Conquer: Comparing base case elements ${arr[low]} and ${arr[high]}`
        });

        if (arr[low] > arr[high]) {
            return { min: arr[high], max: arr[low] };
        } else {
            return { min: arr[low], max: arr[high] };
        }
    }

    let mid = Math.floor((low + high) / 2);
    let left = genMinMax(arr, low, mid);
    let right = genMinMax(arr, mid + 1, high);

    let finalMin = Math.min(left.min, right.min);
    let finalMax = Math.max(left.max, right.max);

    let hlCom = {};
    for(let i=low; i<=high; i++) {
        if (arr[i] === finalMin || arr[i] === finalMax) hlCom[i] = 'hl-combine';
    }
    
    steps.push({
        arr: [...arr], highlights: hlCom, phase: 'combine',
        msg: `Combine: Merged results for range [${low}...${high}] -> Local Min: ${finalMin}, Local Max: ${finalMax}`
    });

    return { min: finalMin, max: finalMax };
}

// 4. Maximum Subarray Sum
function genMaxCrossingSum(arr, low, mid, high) {
    let leftSum = -Infinity, sum = 0, maxLeft = mid;

    for (let i = mid; i >= low; i--) {
        sum += arr[i];
        if (sum > leftSum) { leftSum = sum; maxLeft = i; }
    }

    let rightSum = -Infinity; sum = 0; let maxRight = mid + 1;

    for (let i = mid + 1; i <= high; i++) {
        sum += arr[i];
        if (sum > rightSum) { rightSum = sum; maxRight = i; }
    }

    let hlC = {};
    for(let i=maxLeft; i<=maxRight; i++) hlC[i] = 'hl-conquer';
    
    steps.push({
        arr: [...arr], highlights: hlC, phase: 'conquer',
        msg: `Conquer: Found crossing subarray sum of ${leftSum + rightSum} spanning indices ${maxLeft} to ${maxRight}.`
    });

    return { sum: leftSum + rightSum, low: maxLeft, high: maxRight };
}

function genMaxSubarray(arr, low, high) {
    let hl = {};
    for(let i=low; i<=high; i++) hl[i] = 'hl-divide';
    
    steps.push({
        arr: [...arr], highlights: hl, phase: 'divide',
        msg: `Divide: Checking subarray range [${low}...${high}]`
    });

    if (low === high) {
        return { sum: arr[low], low: low, high: high };
    }

    let mid = Math.floor((low + high) / 2);
    
    let leftRes = genMaxSubarray(arr, low, mid);
    let rightRes = genMaxSubarray(arr, mid + 1, high);
    let crossRes = genMaxCrossingSum(arr, low, mid, high);

    let bestRes = leftRes;
    if (rightRes.sum >= leftRes.sum && rightRes.sum >= crossRes.sum) bestRes = rightRes;
    else if (crossRes.sum >= leftRes.sum && crossRes.sum >= rightRes.sum) bestRes = crossRes;

    let hlCom = {};
    for(let i=bestRes.low; i<=bestRes.high; i++) hlCom[i] = 'hl-combine';

    steps.push({
        arr: [...arr], highlights: hlCom, phase: 'combine',
        msg: `Combine: Comparing Left (${leftRes.sum}), Right (${rightRes.sum}), Cross (${crossRes.sum}). Max here is: ${bestRes.sum}.`
    });

    return bestRes;
}

// 5. Matrix Multiplication (Naive D&C)
function cloneMat(mat) {
    return mat.map(row => [...row]);
}
function getMatHl(rs, re, cs, ce, color) {
    let hl = {};
    for(let r=rs; r<re; r++) for(let c=cs; c<ce; c++) hl[`${r},${c}`] = color;
    return hl;
}
function genMatrixMult(A, B, C, size, rA, cA, rB, cB, rC, cC) {
    let hlA = getMatHl(rA, rA + size, cA, cA + size, 'hl-divide');
    let hlB = getMatHl(rB, rB + size, cB, cB + size, 'hl-divide');
    
    steps.push({
        type: 'matrix', A: cloneMat(A), B: cloneMat(B), C: cloneMat(C), hlA, hlB, hlC: {},
        phase: 'divide', msg: `Divide: Focusing on submatrices of size ${size}.`
    });

    if (size === 1) {
        let prod = A[rA][cA] * B[rB][cB];
        C[rC][cC] += prod;
        
        steps.push({
            type: 'matrix', A: cloneMat(A), B: cloneMat(B), C: cloneMat(C),
            hlA: getMatHl(rA, rA+1, cA, cA+1, 'hl-conquer'),
            hlB: getMatHl(rB, rB+1, cB, cB+1, 'hl-conquer'),
            hlC: getMatHl(rC, rC+1, cC, cC+1, 'hl-combine'),
            phase: 'conquer', msg: `Conquer: ${A[rA][cA]} * ${B[rB][cB]} = ${prod}. Adding to C[${rC}][${cC}].`
        });
        return;
    }

    let next = size / 2;
    // C11
    genMatrixMult(A, B, C, next, rA, cA, rB, cB, rC, cC);
    genMatrixMult(A, B, C, next, rA, cA + next, rB + next, cB, rC, cC);
    // C12
    genMatrixMult(A, B, C, next, rA, cA, rB, cB + next, rC, cC + next);
    genMatrixMult(A, B, C, next, rA, cA + next, rB + next, cB + next, rC, cC + next);
    // C21
    genMatrixMult(A, B, C, next, rA + next, cA, rB, cB, rC + next, cC);
    genMatrixMult(A, B, C, next, rA + next, cA + next, rB + next, cB, rC + next, cC);
    // C22
    genMatrixMult(A, B, C, next, rA + next, cA, rB, cB + next, rC + next, cC + next);
    genMatrixMult(A, B, C, next, rA + next, cA + next, rB + next, cB + next, rC + next, cC + next);
    
    steps.push({
        type: 'matrix', A: cloneMat(A), B: cloneMat(B), C: cloneMat(C),
        hlA: {}, hlB: {}, hlC: getMatHl(rC, rC + size, cC, cC + size, 'hl-combine'),
        phase: 'combine', msg: `Combine: Completed operations for submatrix size ${size}.`
    });
}

// 6. Strassen Matrix Multiplication
function addMat(A, B) {
    let n = A.length; let C = Array(n).fill(0).map(()=>Array(n).fill(0));
    for(let i=0; i<n; i++) for(let j=0; j<n; j++) C[i][j] = A[i][j] + B[i][j];
    return C;
}
function subMat(A, B) {
    let n = A.length; let C = Array(n).fill(0).map(()=>Array(n).fill(0));
    for(let i=0; i<n; i++) for(let j=0; j<n; j++) C[i][j] = A[i][j] - B[i][j];
    return C;
}
function joinMat(C11, C12, C21, C22) {
    let n = C11.length * 2; let C = Array(n).fill(0).map(()=>Array(n).fill(0));
    for(let i=0; i<n/2; i++) {
        for(let j=0; j<n/2; j++) {
            C[i][j] = C11[i][j]; C[i][j+n/2] = C12[i][j];
            C[i+n/2][j] = C21[i][j]; C[i+n/2][j+n/2] = C22[i][j];
        }
    }
    return C;
}

function genStrassen(A, B) {
    let n = A.length;
    if (n === 1) return [[A[0][0] * B[0][0]]];

    // Push states to UI using the original top-level matrices (since Strassen spawns detatched submatrices)
    steps.push({ type: 'matrix', A, B, C: Array(n).fill(0).map(()=>Array(n).fill(0)), hlA:{}, hlB:{}, hlC:{}, phase: 'divide', msg: `Divide: Strassen splitting matrices of size ${n} into 4 parts.`});

    let k = n / 2;
    let A11 = Array(k).fill(0).map(()=>Array(k)); let A12 = Array(k).fill(0).map(()=>Array(k)); let A21 = Array(k).fill(0).map(()=>Array(k)); let A22 = Array(k).fill(0).map(()=>Array(k));
    let B11 = Array(k).fill(0).map(()=>Array(k)); let B12 = Array(k).fill(0).map(()=>Array(k)); let B21 = Array(k).fill(0).map(()=>Array(k)); let B22 = Array(k).fill(0).map(()=>Array(k));
    
    for(let i=0; i<k; i++) for(let j=0; j<k; j++) {
        A11[i][j] = A[i][j]; A12[i][j] = A[i][j+k]; A21[i][j] = A[i+k][j]; A22[i][j] = A[i+k][j+k];
        B11[i][j] = B[i][j]; B12[i][j] = B[i][j+k]; B21[i][j] = B[i+k][j]; B22[i][j] = B[i+k][j+k];
    }

    steps.push({ type: 'matrix', A, B, C: Array(n).fill(0).map(()=>Array(n).fill(0)), hlA:{}, hlB:{}, hlC:{}, phase: 'conquer', msg: `Conquer: Recursively building the 7 Strassen products P1->P7...`});

    let P1 = genStrassen(A11, subMat(B12, B22));
    let P2 = genStrassen(addMat(A11, A12), B22);
    let P3 = genStrassen(addMat(A21, A22), B11);
    let P4 = genStrassen(A22, subMat(B21, B11));
    let P5 = genStrassen(addMat(A11, A22), addMat(B11, B22));
    let P6 = genStrassen(subMat(A12, A22), addMat(B21, B22));
    let P7 = genStrassen(subMat(A11, A21), addMat(B11, B12));

    let C11 = addMat(subMat(addMat(P5, P4), P2), P6);
    let C12 = addMat(P1, P2);
    let C21 = addMat(P3, P4);
    let C22 = subMat(subMat(addMat(P5, P1), P3), P7);

    let C = joinMat(C11, C12, C21, C22);
    steps.push({ type: 'matrix', A, B, C, hlA:{}, hlB:{}, hlC: getMatHl(0,n,0,n, 'hl-combine'), phase: 'combine', msg: `Combine: Reassembled 7 pieces into resulting size ${n} matrix!`});
    return C;
}

// 7. Closest Pair of Points
function ptDist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function genClosestPair(P, GlobalPts) {
    let n = P.length;
    if (n <= 3) {
        let minD = Infinity; let c1=null, c2=null;
        for(let i=0; i<n; i++) {
            for(let j=i+1; j<n; j++) {
                let d = ptDist(P[i], P[j]);
                steps.push({ type: 'geometry', points: GlobalPts, lines: [{p1:P[i], p2:P[j], color:'#dc3545'}], phase: 'conquer', msg: `Conquer: Base-case brute forcing distance of ${d.toFixed(1)}px` });
                if(d < minD) { minD = d; c1 = P[i]; c2 = P[j]; }
            }
        }
        return { d: minD, p1: c1, p2: c2 };
    }

    let mid = Math.floor(n/2);
    let midp = P[mid];

    steps.push({ type: 'geometry', points: GlobalPts, divider: midp.x, phase: 'divide', msg: `Divide: Bisecting bounds recursively at x=${midp.x}` });

    let dL = genClosestPair(P.slice(0, mid), GlobalPts);
    let dR = genClosestPair(P.slice(mid), GlobalPts);

    let d = dL.d; let cp1 = dL.p1; let cp2 = dL.p2;
    if (dR.d < d) { d = dR.d; cp1 = dR.p1; cp2 = dR.p2; }

    steps.push({ type: 'geometry', points: GlobalPts, divider: midp.x, strip: {minX: midp.x - d, maxX: midp.x + d}, closest: [cp1, cp2], phase: 'combine', msg: `Combine: Min of two recursive halves is ${d.toFixed(1)}px. Generating cross-boundary boundary box (Strip).` });

    let strip = [];
    for(let i=0; i<n; i++) if (Math.abs(P[i].x - midp.x) < d) strip.push(P[i]);
    strip.sort((a,b) => a.y - b.y);

    for(let i=0; i<strip.length; i++) {
        for(let j=i+1; j<strip.length && (strip[j].y - strip[i].y) < d; j++) {
            let sD = ptDist(strip[i], strip[j]);
            steps.push({ type: 'geometry', points: GlobalPts, strip: {minX: midp.x - d, maxX: midp.x + d}, lines: [{p1:strip[i], p2:strip[j], color: '#ffc107'}], phase: 'combine', msg: `Combine: Bounding scan inside the strip domain constraint...` });
            if (sD < d) { d = sD; cp1 = strip[i]; cp2 = strip[j]; }
        }
    }
    
    steps.push({ type: 'geometry', points: GlobalPts, closest: [cp1, cp2], phase: 'combine', msg: `Combine local minimum resolved as ${d.toFixed(1)}px.` });
    return { d, p1: cp1, p2: cp2 };
}

// 8. Convex Hull
function crossProd(A, B, C) {
    // Negative because canvas rendering has Y increasing downwards
    return -((B.x - A.x)*(C.y - A.y) - (B.y - A.y)*(C.x - A.x));
}

function genConvexHull(S, GlobalPts, A, B, hull) {
    if (S.length === 0) return;

    let maxDist = -1; let C = null;
    let a = B.y - A.y; let b = A.x - B.x; let c = B.x * A.y - B.y * A.x;

    for (let p of S) {
        let dst = Math.abs(a * p.x + b * p.y + c) / Math.sqrt(a*a + b*b);
        if (dst > maxDist) { maxDist = dst; C = p; }
    }
    if (!C) return;
    
    hull.push(C);
    
    steps.push({ type: 'geometry', points: GlobalPts, hull: [...hull], lines: [{p1:A, p2:C, color: '#ffc107'}, {p1:C, p2:B, color: '#ffc107'}], phase: 'divide', msg: `Divide: Discovered furthest nodal triangle spanning A-C-B.` });

    let s1 = [], s2 = [];
    for (let p of S) {
        if (p === C) continue;
        if (crossProd(A, C, p) > 0) s1.push(p);
        else if (crossProd(C, B, p) > 0) s2.push(p);
    }
    
    steps.push({ type: 'geometry', points: GlobalPts, hull: [...hull], hlPts: [...s1, ...s2], phase: 'conquer', msg: `Conquer: Recursively tracing isolated external sub-domains mapped away from core node paths.` });

    genConvexHull(s1, GlobalPts, A, C, hull);
    genConvexHull(s2, GlobalPts, C, B, hull);
}

// Init listeners
document.addEventListener('DOMContentLoaded', () => {
    runBtn.addEventListener('click', runVisualization);
    
    updateInfoPanel(algoSelect.value);
    
    // Check initial input based on alg
    algoSelect.addEventListener('change', () => {
        const val = algoSelect.value;
        updateInfoPanel(val);
        if (val === 'matrix-mult' || val === 'strassen') {
            arrayInput.value = "4"; // default 4x4
        } else if (val === 'closest-pair' || val === 'convex-hull') {
            arrayInput.value = "30"; // default 30 points
        } else {
            arrayInput.value = "5, 2, 8, 1, 3";
        }
    });

    // Auto-click it once to start the UI properly based on dropdown
    algoSelect.dispatchEvent(new Event('change'));
    
    const arr = parseInput();
    document.getElementById('array-panel').style.display = 'flex';
    renderArray(arr);
});
