/**
 * charts.js
 * Handles the dynamic rendering of Time Complexity graphs using Chart.js.
 */

let complexityChartInstance = null;
let currentIsDark = false;

// Functional Approximations for plotting
const log2 = Math.log2;
const power = Math.pow;

function generateDataPoints(func, maxN = 100, step = 5) {
    let data = [];
    for (let i = 1; i <= maxN; i += step) {
        data.push({ x: i, y: func(i) });
    }
    return data;
}

const complexityCurves = {
    'O(1)': (n) => 10,
    'O(n)': (n) => n,
    'O(n log n)': (n) => n * (log2(n) || 1),
    'O(n^2)': (n) => power(n, 2),
    'O(n^2.81)': (n) => power(n, 2.81),
    'O(n^3)': (n) => power(n, 3)
};

// Colors based on generic "speed"
const curveStyles = {
    'O(n)': { borderColor: '#28a745', borderDash: [5, 5] },
    'O(n log n)': { borderColor: '#17a2b8', borderDash: [5, 5] },
    'O(n^2)': { borderColor: '#ffc107', borderDash: [5, 5] },
    'O(n^2.81)': { borderColor: '#fd7e14', borderDash: [5, 5] },
    'O(n^3)': { borderColor: '#dc3545', borderDash: [5, 5] }
};

window.drawComplexityChart = function(algoKey) {
    const ctx = document.getElementById('complexityChart').getContext('2d');
    
    // Destroy previous chart
    if (complexityChartInstance) {
        complexityChartInstance.destroy();
    }

    // Determine target complexity class to highlight
    let targetO = 'O(n log n)'; // Default
    if (algoKey === 'min-max') targetO = 'O(n)';
    else if (algoKey === 'quick-sort') targetO = 'O(n^2)'; // we chart the exact structure usually or worst case
    else if (algoKey === 'matrix-mult') targetO = 'O(n^3)';
    else if (algoKey === 'strassen') targetO = 'O(n^2.81)';
    
    // Build datasets explicitly focusing on comparing n, n log n, and n^2
    const baseDatasets = [
        { label: 'O(n)', data: generateDataPoints(complexityCurves['O(n)']), ...curveStyles['O(n)'], borderWidth: 2, fill: false, tension: 0.4, pointRadius: 0 },
        { label: 'O(n log n)', data: generateDataPoints(complexityCurves['O(n log n)']), ...curveStyles['O(n log n)'], borderWidth: 2, fill: false, tension: 0.4, pointRadius: 0 },
        { label: 'O(n^2)', data: generateDataPoints(complexityCurves['O(n^2)'], 100, 5).map(p => ({...p, y: p.y / 10})), ...curveStyles['O(n^2)'], borderWidth: 2, fill: false, tension: 0.4, pointRadius: 0 } // scaled down slightly to fit graph better
    ];

    // If we have a special high-polynomial like cubic or strassen, splice them in natively
    if (algoKey === 'matrix-mult') {
        baseDatasets.push({ label: 'O(n^3) [Naive]', data: generateDataPoints(complexityCurves['O(n^3)'], 100, 5).map(p=>({...p, y:p.y/300})), ...curveStyles['O(n^3)'], borderWidth: 2, fill: false, tension: 0.4, pointRadius: 0});
    } else if (algoKey === 'strassen') {
        baseDatasets.push({ label: 'O(n^2.81) [Strassen]', data: generateDataPoints(complexityCurves['O(n^2.81)'], 100, 5).map(p=>({...p, y:p.y/100})), ...curveStyles['O(n^2.81)'], borderWidth: 2, fill: false, tension: 0.4, pointRadius: 0});
    }

    // Highlight the target curve
    baseDatasets.forEach(ds => {
        if (ds.label.includes(targetO)) {
            ds.borderWidth = 4;
            ds.borderDash = []; // solid line
        } else {
            // ds.borderColor = currentIsDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
            ds.borderWidth = 1;
        }
    });

    const textColor = currentIsDark ? '#e0e0e0' : '#2b2d42';
    const gridColor = currentIsDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    complexityChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: baseDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: textColor, font: { family: 'Inter', size: 10 } }
                },
                tooltip: { enabled: false }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Elements (n)', color: textColor },
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                y: {
                    title: { display: true, text: 'Operations (Approx)', color: textColor },
                    grid: { color: gridColor },
                    ticks: { color: textColor, display: false },
                    min: 0,
                    max: 300 // Normalize visually
                }
            }
        }
    });
};

window.updateChartTheme = function(isDark) {
    currentIsDark = isDark;
    if (window.appState && window.appState.getAlgo()) {
        window.drawComplexityChart(window.appState.getAlgo());
    }
};
