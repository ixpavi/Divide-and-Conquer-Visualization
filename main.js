/**
 * main.js
 * App Controller managing SPA routing, Theme toggling, and Global state logic.
 */

// Global App State
const state = {
    currentAlgo: null,
    theme: 'light-theme'
};

// UI Elements
const themeToggle = document.getElementById('theme-toggle');
const navLinks = document.querySelectorAll('.nav-link');
const pageHome = document.getElementById('page-home');
const pageAlgo = document.getElementById('page-algorithm');
const pageTitle = document.getElementById('page-title');

const dtInput = document.getElementById('data-input');
const lblInput = document.getElementById('data-input-label');
const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');
const speedSlider = document.getElementById('speed-slider');

// MathJax trigger
function reRenderMath() {
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

// Data Library for formatting pages
const algoDetails = {
    'merge-sort': {
        title: 'Merge Sort',
        desc: 'A classic comparison-based sorting algorithm based on the divide-and-conquer strategy.',
        div: 'Split the unsorted list down the middle into two sublists of about half the size.',
        conq: 'Recursively sort the two sublists.',
        comb: 'Merge the two sorted sublists back into one sorted list.',
        rec: 'T(n) = 2T(n/2) + O(n)',
        best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)',
        inputMode: 'array', defVal: '5, 2, 8, 1, 3, 9, 4, 7',
        treeSupport: true,
        pseudo: [
            "function mergeSort(arr, l, r):",
            "    if l >= r return",
            "    mid = (l + r) / 2",
            "    mergeSort(arr, l, mid)",
            "    mergeSort(arr, mid + 1, r)",
            "    merge(arr, l, mid, r)"
        ]
    },
    'quick-sort': {
        title: 'Quick Sort',
        desc: 'An efficient, in-place sorting algorithm that partitions arrays around a pivot.',
        div: 'Pick a pivot element. Partition the array so all elements smaller are to its left, and larger are to its right.',
        conq: 'Recursively apply the same logic to the left and right partitions.',
        comb: 'The combine step is trivial (do nothing), as the array is sorted in place.',
        rec: 'T(n) = 2T(n/2) + O(n)',
        best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n^2)',
        inputMode: 'array', defVal: '15, 3, 9, 8, 5, 2, 7',
        treeSupport: true,
        pseudo: [
            "function quickSort(arr, low, high):",
            "    if low < high:",
            "        pivot_idx = partition(arr, low, high)",
            "        quickSort(arr, low, pivot_idx - 1)",
            "        quickSort(arr, pivot_idx + 1, high)"
        ]
    },
    'min-max': {
        title: 'Min and Max Finding',
        desc: 'An optimal tournament-style algorithm to find both extrema simultaneously with 3n/2 - 2 comparisons.',
        div: 'Split the array into two halves.',
        conq: 'Recursively find the (min, max) of both halves. If the span is small enough (1 or 2 items), solve exactly.',
        comb: 'Compare the min of the left with the min of the right, and max of the left with max of the right.',
        rec: 'T(n) = 2T(n/2) + O(1)',
        best: 'O(n)', avg: 'O(n)', worst: 'O(n)',
        inputMode: 'array', defVal: '4, 1, 9, -2, 7, 3, 8',
        treeSupport: true,
        pseudo: [
            "function findMinMax(arr, l, r):",
            "    if l == r return (arr[l], arr[l])",
            "    if r == l + 1 return min/max of arr[l], arr[r]",
            "    mid = (l + r) / 2",
            "    leftMinMax = findMinMax(arr, l, mid)",
            "    rightMinMax = findMinMax(arr, mid + 1, r)",
            "    return (min(leftMinMax.min, rightMinMax.min),",
            "            max(leftMinMax.max, rightMinMax.max))"
        ]
    },
    'max-subarray': {
        title: 'Largest Subarray Sum',
        desc: 'Finds the contiguous subarray within a one-dimensional array of numbers which has the largest sum.',
        div: 'Divide the given array in two halves.',
        conq: 'Recursively find the max subarray sum in the left half and right half.',
        comb: 'Compute the max subarray sum crossing the midpoint. Return the maximum of the three.',
        rec: 'T(n) = 2T(n/2) + O(n)',
        best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)',
        inputMode: 'array', defVal: '-2, 1, -3, 4, -1, 2, 1, -5, 4',
        treeSupport: true,
        pseudo: [
            "function maxSubArray(arr, l, r):",
            "    if l == r return arr[l]",
            "    mid = (l + r) / 2",
            "    L = maxSubArray(arr, l, mid)",
            "    R = maxSubArray(arr, mid + 1, r)",
            "    C = maxCrossing(arr, l, mid, r)",
            "    return max(L, R, C)"
        ]
    },
    'matrix-mult': {
        title: 'Matrix Multiplication (Naive)',
        desc: 'Evaluates the dot product of two matrices recursively by splitting them into blocks.',
        div: 'Partition matrices A and B into 4 submatrices of size (n/2)x(n/2).',
        conq: 'Recursively compute 8 submatrix products.',
        comb: 'Add the resulting pairs of products together to form the 4 quadrants of the result matrix C.',
        rec: 'T(n) = 8T(n/2) + O(n^2)',
        best: 'O(n^3)', avg: 'O(n^3)', worst: 'O(n^3)',
        inputMode: 'scalar', defVal: '4',
        treeSupport: true,
        pseudo: [
            "function multiply(A, B):",
            "    if A.size == 1 return A[0][0] * B[0][0]",
            "    split A into A11, A12, A21, A22",
            "    split B into B11, B12, B21, B22",
            "    C11 = multiply(A11, B11) + multiply(A12, B21)",
            "    C12 = multiply(A11, B12) + multiply(A12, B22)",
            "    C21 = multiply(A21, B11) + multiply(A22, B21)",
            "    C22 = multiply(A21, B12) + multiply(A22, B22)",
            "    return combined C"
        ]
    },
    'strassen': {
        title: "Strassen's Multiplication",
        desc: 'An asymptotically faster algorithm for matrix multiplication exploiting clever arithmetic formulas.',
        div: 'Partition matrices A and B into 4 submatrices.',
        conq: 'Create 10 matrices by adding/subtracting submatrices, then recursively compute 7 matrix products (instead of 8).',
        comb: 'Add and subtract the 7 products to generate the final 4 functional quadrants of C.',
        rec: 'T(n) = 7T(n/2) + O(n^2)',
        best: 'O(n^2.81)', avg: 'O(n^2.81)', worst: 'O(n^2.81)',
        inputMode: 'scalar', defVal: '4',
        treeSupport: false,
        pseudo: [
            "function strassen(A, B):",
            "    if A.size == 1 return A[0][0] * B[0][0]",
            "    form 10 submatrices S1 to S10 via add/sub",
            "    P1 = strassen(A11, S1)",
            "    P2 = strassen(S2, B22)",
            "    P3 = strassen(S3, B11)",
            "    P4 = strassen(A22, S4)",
            "    P5 = strassen(S5, S6)",
            "    P6 = strassen(S7, S8)",
            "    P7 = strassen(S9, S10)",
            "    C11 = P5 + P4 - P2 + P6",
            "    C12 = P1 + P2",
            "    C21 = P3 + P4",
            "    C22 = P5 + P1 - P3 - P7",
            "    return combined C"
        ]
    },
    'closest-pair': {
        title: 'Closest Pair of Points',
        desc: 'Finds the two closest points in a 2D plane in O(n log n) time rather than brute-force O(n^2).',
        div: 'Sort points by X. Draw a vertical line bisecting the set into two equal halves.',
        conq: 'Recursively find the closest pair in the left and right halves. Let min(d_left, d_right) = d.',
        comb: 'Check a vertical "strip" of width 2d centered on the dividing line. Scan points sorted by Y to see if any cross-boundary pairs are closer than d.',
        rec: 'T(n) = 2T(n/2) + O(n)',
        best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)',
        inputMode: 'scalar', defVal: '30',
        treeSupport: false,
        pseudo: [
            "function closestPair(Px, Py):",
            "    if len(Px) <= 3 return bruteForce(Px)",
            "    mid = len(Px) / 2",
            "    Lx, Ly = left half of Px, Py",
            "    Rx, Ry = right half of Px, Py",
            "    d1 = closestPair(Lx, Ly)",
            "    d2 = closestPair(Rx, Ry)",
            "    d = min(d1, d2)",
            "    strip = points within d of split line",
            "    return min(d, closest_in_strip(strip))"
        ]
    },
    'convex-hull': {
        title: 'Convex Hull (QuickHull)',
        desc: 'Discovers the smallest convex polygon containing all points, functionally similar to Quicksort.',
        div: 'Find points with min and max X to form a dividing line. Find the point furthest from this line to form a triangle.',
        conq: 'The points inside the triangle cannot be part of the hull. Recursively process the points strictly outside the remaining two edges.',
        comb: 'The hull is formed by appending the extrema discovered natively during the depth-first search.',
        rec: 'T(n) = 2T(n/2) + O(n)',
        best: 'O(n)', avg: 'O(n log n)', worst: 'O(n^2)',
        inputMode: 'scalar', defVal: '35',
        treeSupport: false,
        pseudo: [
            "function quickHull(points):",
            "    find minX and maxX point (A, B)",
            "    hull.add(A); hull.add(B)",
            "    Set1 = points on 'right' of line AB",
            "    Set2 = points on 'right' of line BA",
            "    findHull(Set1, A, B)",
            "    findHull(Set2, B, A)",
            "",
            "function findHull(set, P, Q):",
            "    if set is empty return",
            "    C = point furthest from line PQ",
            "    hull.add(C)",
            "    S1 = points on 'right' of PC",
            "    S2 = points on 'right' of CQ",
            "    findHull(S1, P, C)",
            "    findHull(S2, C, Q)"
        ]
    }
};

// Theme Toggling
themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'light-theme' ? 'dark-theme' : 'light-theme';
    document.body.className = state.theme;
    if (window.updateChartTheme) window.updateChartTheme(state.theme === 'dark-theme');
});

// Routing
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        // Pause any running visualizations immediately
        if (window.visualizer) window.visualizer.reset();

        navLinks.forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');

        const target = e.target.getAttribute('data-target');

        if (target === 'home') {
            pageHome.style.display = 'block';
            pageAlgo.style.display = 'none';
            pageTitle.textContent = "Introduction to Divide and Conquer";
            state.currentAlgo = null;
        } else {
            pageHome.style.display = 'none';
            pageAlgo.style.display = 'block';
            loadAlgorithmPage(target);
        }
    });
});

function loadAlgorithmPage(algoKey) {
    state.currentAlgo = algoKey;
    const info = algoDetails[algoKey];

    // Update Header
    pageTitle.textContent = info.title;

    // Update Theory
    document.getElementById('theory-desc').textContent = info.desc;
    document.getElementById('theory-div').textContent = info.div;
    document.getElementById('theory-conq').textContent = info.conq;
    document.getElementById('theory-comb').textContent = info.comb;
    document.getElementById('theory-equation').innerHTML = `\\( ${info.rec} \\)`;
    reRenderMath();

    // Update Complexities Status
    document.getElementById('comp-best').textContent = info.best;
    document.getElementById('comp-avg').textContent = info.avg;
    document.getElementById('comp-worst').textContent = info.worst;

    // Set UI Input Type
    if (info.inputMode === 'array') {
        lblInput.textContent = "Array Input (comma separated):";
    } else if (info.inputMode === 'scalar' && algoKey.includes('matrix')) {
        lblInput.textContent = "Matrix Size N (e.g. 2, 4):";
    } else {
        lblInput.textContent = "Number of Layout Points (e.g. 20, 50):";
    }
    dtInput.value = info.defVal;

    // Update Chart.js Context
    if (window.drawComplexityChart) window.drawComplexityChart(algoKey);

    // Render Pseudocode
    if (info.pseudo) {
        const pseudoHTML = info.pseudo.map((lineText, idx) =>
            `<span class="code-line" id="pseudo-line-${idx}">${lineText}</span>`
        ).join('\n');
        document.getElementById('algo-pseudocode').innerHTML = pseudoHTML;
    }

    // Toggle Recursion Tree Support
    const recPanel = document.getElementById('recursion-panel');
    if (info.treeSupport) {
        recPanel.style.display = 'flex';
    } else {
        recPanel.style.display = 'none';
    }

    // Prepare Visualization layout
    console.log('[DEBUG] Calling prepareLayer with:', algoKey, info.inputMode);
    if (window.visualizer) window.visualizer.prepareLayer(algoKey, info.inputMode);
}

// Global controls export
window.appState = {
    getAlgo: () => state.currentAlgo,
    getInput: () => dtInput.value.trim(),
    getSpeed: () => parseInt(speedSlider.value)
};
