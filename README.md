# Divide and Conquer Algorithm Visualizer - Advanced Educational Platform

Welcome to the **Divide and Conquer Algorithm Visualizer**, a modern, fully-featured educational web application built to interactively teach 8 complex algorithmic paradigms natively in the browser.

## Features

- **No Installation Required**: Absolutely zero web frameworks or npm tools dependency. Runs strictly offline in Vanilla HTML, JS, CSS.
- **Modern UI & Theming**: Features a persistent left sidebar for Single-Page Application (SPA) routing, and a quick dark/light mode toggle.
- **Dynamic Time Complexity Context**: Integrates **Chart.js** via CDN to dynamically graph theoretical complexities ($O(n)$, $O(n \log n)$, $O(n^2)$) comparing input size vs operations.
- **Robust Visual Engine**: A stable, timing-based step-generator avoiding race-conditions with Play/Pause/Reset hooks and a speed slider.
- **Detailed Stages**: Explicit breakdowns showing precisely what happens at the **Divide**, **Conquer**, and **Combine** level natively supported by deep theoretical text explanations updating per algorithm.

## Modular Architecture

The application was uniquely rewritten to isolate domains of responsibility cleanly:
1. `index.html`: The structural DOM template containing the SPA sections and charting canvas containers.
2. `style.css`: The UI design system managing Flexbox grids, CSS variables for theming, and animation states.
3. `main.js`: The Global App Controller. Handles route switching when sidebar links are clicked, dynamically populating theoretical text, layout modes, and Chart.js instances.
4. `charts.js`: Isolated Chart.js handler rapidly plotting and coloring polynomial scaling curves.
5. `algorithms.js`: The pure logic engine calculating $O(n \log n)$ array sorts or Strassen's matrix recursion as pure functional arrays of static UI changes over time.
6. `visualizer.js`: The DOM/Canvas playback loop. Consumes arrays constructed by the algorithms and plots them dynamically bridging Canvas API calls to UI state highlighting.

## Included Algorithms

1. **Merge Sort**: Recursively splits the array down to 1 element, then linearly merges them in sorted order.
2. **Quick Sort**: Uses a pivot element, swapping values less than the pivot to the left partition.
3. **Min and Max**: Finds both the global minimum and maximum simultaneously by splitting the array repeatedly.
4. **Maximum Subarray Sum**: Discovers the optimal contiguous sub-range optimally across bounds.
5. **Matrix Multiplication (Naive)**: Recursively splits an input `NxN` matrix into isolated submatrices.
6. **Strassen's Multiplication**: Generates 7 complex sub-products optimally in time $O(n^{2.81})$.
7. **Closest Pair of Points**: Sorts 2D points by X, isolates domains into Canvas blocks, and checks across an optimal inner strip.
8. **Convex Hull (QuickHull)**: Divides Canvas point domains into triangles and discovers outmost bounds to generate polygonal hulls.

## How to Run Locally

1. Open this directory folder.
2. Double click the `index.html` file, which will automatically render in your system's default web browser. Note: An active internet connection is recommended upon first load strictly to download MathJax and Chart.js from their CDN distributions.
3. Use the Sidebar navigation to select an algorithm.
4. Edit the inputs inside the controls box as desired.
5. Hit **▶ Start** and drag the Speed Slider to watch the visualization frame-by-frame!
