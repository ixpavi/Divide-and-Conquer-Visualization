/**
 * algorithms.js
 * Contains the pure logic for all 8 Divide and Conquer algorithms.
 * Each function returns an array of "step" objects detailing the state changes over time.
 */

window.algorithms = {
    // 1. Merge Sort
    genMergeSort: function(arr) {
        let steps = [];
        let internalArr = [...arr];
        let treeNodes = [];
        let nodeId = 0;

        const updateNode = (id, state) => {
            let n = treeNodes.find(x => x.id === id);
            if (n) n.state = state;
        };

        function mergeSort(arr, l, r, level, parentId) {
            let myId = nodeId++;
            treeNodes.push({ id: myId, label: `${l},${r}`, level, parent: parentId, state: 'divide' });

            steps.push({ type: 'array', arr: [...internalArr], hl: {[l]: 'hl-active'}, phase: 'divide', line: 0, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Entering mergeSort(${l}, ${r})` });

            if (l >= r) {
                steps.push({ type: 'array', arr: [...internalArr], hl: {[l]: 'hl-active'}, phase: 'divide', line: 1, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Base case reached at index ${l}` });
                updateNode(myId, 'combine');
                return;
            }
            let mid = Math.floor((l + r) / 2);
            
            let hl = {};
            for(let i=l; i<=r; i++) hl[i] = 'hl-divide';
            hl[mid] = 'hl-active';
            steps.push({ type: 'array', arr: [...internalArr], hl, phase: 'divide', line: 2, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Dividing array from index ${l} to ${r} at mid=${mid}` });

            steps.push({ type: 'array', arr: [...internalArr], hl, phase: 'divide', line: 3, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Recursive call: Merge Sort Left [${l}...${mid}]` });
            mergeSort(arr, l, mid, level + 1, myId);

            steps.push({ type: 'array', arr: [...internalArr], hl, phase: 'divide', line: 4, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Recursive call: Merge Sort Right [${mid + 1}...${r}]` });
            mergeSort(arr, mid + 1, r, level + 1, myId);
            
            updateNode(myId, 'conquer');
            steps.push({ type: 'array', arr: [...internalArr], hl:{}, phase: 'conquer', line: 5, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Merging the left and right sorted sublists...` });
            merge(arr, l, mid, r, myId);
        }

        function merge(arr, l, mid, r, myId) {
            let hl = {};
            for(let i=l; i<=r; i++) hl[i] = 'hl-conquer';
            steps.push({ type: 'array', arr: [...internalArr], hl, phase: 'conquer', line: 5, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Conquering by merging left (${l}-${mid}) and right (${mid+1}-${r})` });

            let n1 = mid - l + 1; let n2 = r - mid;
            let L = new Array(n1), R = new Array(n2);

            for (let i = 0; i < n1; i++) L[i] = internalArr[l + i];
            for (let j = 0; j < n2; j++) R[j] = internalArr[mid + 1 + j];

            let i = 0, j = 0, k = l;
            while (i < n1 && j < n2) {
                if (L[i] <= R[j]) { internalArr[k] = L[i]; i++; } 
                else { internalArr[k] = R[j]; j++; }
                k++;
            }
            while (i < n1) { internalArr[k] = L[i]; i++; k++; }
            while (j < n2) { internalArr[k] = R[j]; j++; k++; }

            let hlC = {};
            for(let x=l; x<=r; x++) hlC[x] = 'hl-combine';
            updateNode(myId, 'combine');
            steps.push({ type: 'array', arr: [...internalArr], hl: hlC, phase: 'combine', line: 5, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Combined sorted ranges into sub-array [${l}...${r}]` });
        }

        mergeSort(internalArr, 0, internalArr.length - 1, 0, null);
        steps.push({ type: 'array', arr: [...internalArr], hl: {}, phase: 'finish', msg: "Merge Sort Complete!", end: true });
        return steps;
    },

    // 2. Quick Sort
    genQuickSort: function(arr) {
        let steps = [];
        let internalArr = [...arr];
        let treeNodes = [];
        let nodeId = 0;

        const updateNode = (id, state) => {
            let n = treeNodes.find(x => x.id === id);
            if (n) n.state = state;
        };

        function quickSort(arr, low, high, level, parentId) {
            let myId = nodeId++;
            treeNodes.push({ id: myId, label: `${low},${high}`, level, parent: parentId, state: 'divide' });

            steps.push({ type: 'array', arr: [...internalArr], hl: {[low]: 'hl-active', [high]: 'hl-active'}, phase: 'divide', line: 0, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Entering quickSort(${low}, ${high})` });
            steps.push({ type: 'array', arr: [...internalArr], hl: {[low]: 'hl-active', [high]: 'hl-active'}, phase: 'divide', line: 1, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Checking if low < high` });

            if (low >= high) {
                updateNode(myId, 'combine');
                return;
            }

            let pi = partition(arr, low, high, myId);

            steps.push({ type: 'array', arr: [...internalArr], hl: {[pi]: 'hl-sorted'}, phase: 'divide', line: 3, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Recursive call: Quick Sort Left [${low}...${pi - 1}]` });
            quickSort(arr, low, pi - 1, level + 1, myId);

            steps.push({ type: 'array', arr: [...internalArr], hl: {[pi]: 'hl-sorted'}, phase: 'divide', line: 4, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Recursive call: Quick Sort Right [${pi + 1}...${high}]` });
            quickSort(arr, pi + 1, high, level + 1, myId);
            
            updateNode(myId, 'combine');
        }

        function partition(arr, low, high, myId) {
            let pivot = internalArr[high];
            let hl = {};
            for(let i=low; i<=high; i++) hl[i] = 'hl-divide';
            hl[high] = 'hl-active';
            
            steps.push({ type: 'array', arr: [...internalArr], hl, phase: 'divide', line: 2, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Divide: Chose pivot ${pivot} at index ${high}. Partitioning range [${low}...${high}]` });

            let i = (low - 1);
            for (let j = low; j <= high - 1; j++) {
                steps.push({
                    type: 'array', arr: [...internalArr], 
                    hl: {...hl, [j]: 'hl-conquer', [i >= low ? i : low]: 'hl-conquer'}, 
                    phase: 'conquer', line: 2, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Conquer: Checking if ${internalArr[j]} is smaller than pivot ${pivot}`
                });

                if (internalArr[j] < pivot) {
                    i++;
                    let temp = internalArr[i];
                    internalArr[i] = internalArr[j];
                    internalArr[j] = temp;
                    let swapHl = { [i]: 'hl-combine', [j]: 'hl-combine', [high]: 'hl-active'};
                    steps.push({ type: 'array', arr: [...internalArr], hl: swapHl, phase: 'combine', line: 2, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Combine (Swap): Swapped ${internalArr[i]} and ${internalArr[j]} into left partition.` });
                }
            }
            let temp = internalArr[i + 1];
            internalArr[i + 1] = internalArr[high];
            internalArr[high] = temp;
            
            updateNode(myId, 'conquer');
            steps.push({ type: 'array', arr: [...internalArr], hl: {[i+1]: 'hl-sorted'}, phase: 'combine', line: 2, treeNodes: JSON.parse(JSON.stringify(treeNodes)), msg: `Combine (Pivot): Placed pivot ${pivot} securely at final index ${i+1}.` });
            return (i + 1);
        }

        quickSort(internalArr, 0, internalArr.length - 1, 0, null);
        steps.push({ type: 'array', arr: [...internalArr], hl: {}, phase: 'finish', msg: "Quick Sort Complete!", end: true });
        return steps;
    },

    // 3. Min and Max Finding
    genMinMax: function(arr) {
        let steps = [];
        let internalArr = [...arr];

        function findMinMax(arr, low, high) {
            let hl = {};
            for(let i=low; i<=high; i++) hl[i] = 'hl-divide';
            steps.push({ type: 'array', arr: [...internalArr], hl, phase: 'divide', msg: `Divide: Examining subarray range [${low}...${high}]` });

            if (low === high) return { min: arr[low], max: arr[low] };

            if (high === low + 1) {
                let hlC = { [low]: 'hl-conquer', [high]: 'hl-conquer' };
                steps.push({ type: 'array', arr: [...internalArr], hl: hlC, phase: 'conquer', msg: `Conquer: Comparing base case elements ${arr[low]} and ${arr[high]}` });
                if (arr[low] > arr[high]) return { min: arr[high], max: arr[low] };
                else return { min: arr[low], max: arr[high] };
            }

            let mid = Math.floor((low + high) / 2);
            let left = findMinMax(arr, low, mid);
            let right = findMinMax(arr, mid + 1, high);

            let finalMin = Math.min(left.min, right.min);
            let finalMax = Math.max(left.max, right.max);

            let hlCom = {};
            for(let i=low; i<=high; i++) {
                if (arr[i] === finalMin || arr[i] === finalMax) hlCom[i] = 'hl-combine';
            }
            steps.push({ type: 'array', arr: [...internalArr], hl: hlCom, phase: 'combine', msg: `Combine: Merged results for range [${low}...${high}] -> Local Min: ${finalMin}, Local Max: ${finalMax}` });
            return { min: finalMin, max: finalMax };
        }

        let res = findMinMax(internalArr, 0, internalArr.length - 1);
        steps.push({ type: 'array', arr: [...internalArr], hl: {}, phase: 'finish', msg: `Finished! Global Min is ${res.min}, Global Max is ${res.max}`, end: true });
        return steps;
    },

    // 4. Maximum Subarray Sum
    genMaxSubarray: function(arr) {
        let steps = [];
        let internalArr = [...arr];

        function maxCrossingSum(arr, low, mid, high) {
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
            steps.push({ type: 'array', arr: [...internalArr], hl: hlC, phase: 'conquer', msg: `Conquer: Found crossing subarray sum of ${leftSum + rightSum} spanning indices ${maxLeft} to ${maxRight}.` });
            return { sum: leftSum + rightSum, low: maxLeft, high: maxRight };
        }

        function maxSubarr(arr, low, high) {
            let hl = {};
            for(let i=low; i<=high; i++) hl[i] = 'hl-divide';
            steps.push({ type: 'array', arr: [...internalArr], hl, phase: 'divide', msg: `Divide: Checking subarray range [${low}...${high}]` });

            if (low === high) return { sum: arr[low], low: low, high: high };

            let mid = Math.floor((low + high) / 2);
            let leftRes = maxSubarr(arr, low, mid);
            let rightRes = maxSubarr(arr, mid + 1, high);
            let crossRes = maxCrossingSum(arr, low, mid, high);

            let bestRes = leftRes;
            if (rightRes.sum >= leftRes.sum && rightRes.sum >= crossRes.sum) bestRes = rightRes;
            else if (crossRes.sum >= leftRes.sum && crossRes.sum >= rightRes.sum) bestRes = crossRes;

            let hlCom = {};
            for(let i=bestRes.low; i<=bestRes.high; i++) hlCom[i] = 'hl-combine';
            steps.push({ type: 'array', arr: [...internalArr], hl: hlCom, phase: 'combine', msg: `Combine: Comparing Left (${leftRes.sum}), Right (${rightRes.sum}), Cross (${crossRes.sum}). Local Max is: ${bestRes.sum}.` });
            return bestRes;
        }

        let res = maxSubarr(internalArr, 0, internalArr.length - 1);
        let finalHl = {};
        for(let i = res.low; i <= res.high; i++) finalHl[i] = 'hl-combine';
        steps.push({ type: 'array', arr: [...internalArr], hl: finalHl, phase: 'finish', msg: `Finished! Maximum Subarray sum is ${res.sum} (spanning index ${res.low} to ${res.high})`, end: true });
        return steps;
    },

    /* --- MATRIX ALGORITHMS --- */
    cloneMat: function(mat) { return mat.map(row => [...row]); },
    getMatHl: function(rs, re, cs, ce, color) {
        let hl = {};
        for(let r=rs; r<re; r++) for(let c=cs; c<ce; c++) hl[`${r},${c}`] = color;
        return hl;
    },

    // 5. Matrix Multiplication (Naive)
    genMatrixMult: function(n) {
        let steps = [];
        let A = Array(n).fill(0).map(() => Array(n).fill(0).map(() => Math.floor(Math.random()*9)+1));
        let B = Array(n).fill(0).map(() => Array(n).fill(0).map(() => Math.floor(Math.random()*9)+1));
        let C = Array(n).fill(0).map(() => Array(n).fill(0));
        let ctx = this;

        steps.push({ type: 'matrix', A: ctx.cloneMat(A), B: ctx.cloneMat(B), C: ctx.cloneMat(C), hlA:{}, hlB:{}, hlC:{}, phase: 'divide', msg: `Generated ${n}x${n} Matrices A and B.` });

        function multiply(A, B, C, size, rA, cA, rB, cB, rC, cC) {
            let hlA = ctx.getMatHl(rA, rA + size, cA, cA + size, 'hl-divide');
            let hlB = ctx.getMatHl(rB, rB + size, cB, cB + size, 'hl-divide');
            steps.push({ type: 'matrix', A: ctx.cloneMat(A), B: ctx.cloneMat(B), C: ctx.cloneMat(C), hlA, hlB, hlC: {}, phase: 'divide', msg: `Divide: Focusing on submatrices of size ${size}.` });

            if (size === 1) {
                let prod = A[rA][cA] * B[rB][cB];
                C[rC][cC] += prod;
                steps.push({ type: 'matrix', A: ctx.cloneMat(A), B: ctx.cloneMat(B), C: ctx.cloneMat(C), hlA: ctx.getMatHl(rA, rA+1, cA, cA+1, 'hl-conquer'), hlB: ctx.getMatHl(rB, rB+1, cB, cB+1, 'hl-conquer'), hlC: ctx.getMatHl(rC, rC+1, cC, cC+1, 'hl-combine'), phase: 'conquer', msg: `Conquer: ${A[rA][cA]} * ${B[rB][cB]} = ${prod}. Adding to C[${rC}][${cC}].` });
                return;
            }

            let next = size / 2;
            multiply(A, B, C, next, rA, cA, rB, cB, rC, cC);
            multiply(A, B, C, next, rA, cA + next, rB + next, cB, rC, cC);
            multiply(A, B, C, next, rA, cA, rB, cB + next, rC, cC + next);
            multiply(A, B, C, next, rA, cA + next, rB + next, cB + next, rC, cC + next);
            multiply(A, B, C, next, rA + next, cA, rB, cB, rC + next, cC);
            multiply(A, B, C, next, rA + next, cA + next, rB + next, cB, rC + next, cC);
            multiply(A, B, C, next, rA + next, cA, rB, cB + next, rC + next, cC + next);
            multiply(A, B, C, next, rA + next, cA + next, rB + next, cB + next, rC + next, cC + next);
            
            steps.push({ type: 'matrix', A: ctx.cloneMat(A), B: ctx.cloneMat(B), C: ctx.cloneMat(C), hlA: {}, hlB: {}, hlC: ctx.getMatHl(rC, rC + size, cC, cC + size, 'hl-combine'), phase: 'combine', msg: `Combine: Completed operations for submatrix size ${size}.` });
        }

        multiply(A, B, C, n, 0, 0, 0, 0, 0, 0);
        steps.push({ type: 'matrix', A, B, C, hlA:{}, hlB:{}, hlC: ctx.getMatHl(0,n,0,n,'hl-sorted'), phase: 'finish', msg: "Matrix Multiplication Complete!", end: true });
        return steps;
    },

    // 6. Strassen Matrix Multiplication
    genStrassen: function(n) {
        let steps = [];
        let A = Array(n).fill(0).map(() => Array(n).fill(0).map(() => Math.floor(Math.random()*9)+1));
        let B = Array(n).fill(0).map(() => Array(n).fill(0).map(() => Math.floor(Math.random()*9)+1));
        let ctx = this;

        steps.push({ type: 'matrix', A: ctx.cloneMat(A), B: ctx.cloneMat(B), C: Array(n).fill(0).map(() => Array(n).fill(0)), hlA:{}, hlB:{}, hlC:{}, phase: 'divide', msg: `Generated ${n}x${n} Matrices A and B for Strassen's.` });

        function addMat(X, Y) { let k = X.length; let R = Array(k).fill(0).map(()=>Array(k).fill(0)); for(let i=0;i<k;i++) for(let j=0;j<k;j++) R[i][j]=X[i][j]+Y[i][j]; return R; }
        function subMat(X, Y) { let k = X.length; let R = Array(k).fill(0).map(()=>Array(k).fill(0)); for(let i=0;i<k;i++) for(let j=0;j<k;j++) R[i][j]=X[i][j]-Y[i][j]; return R; }
        function joinMat(C11, C12, C21, C22) { let k=C11.length*2; let R=Array(k).fill(0).map(()=>Array(k).fill(0)); for(let i=0;i<k/2;i++) { for(let j=0;j<k/2;j++) { R[i][j]=C11[i][j]; R[i][j+k/2]=C12[i][j]; R[i+k/2][j]=C21[i][j]; R[i+k/2][j+k/2]=C22[i][j]; } } return R; }

        function strassenRec(A, B) {
            let k = A.length;
            if (k === 1) return [[A[0][0] * B[0][0]]];

            steps.push({ type: 'matrix', A, B, C: Array(k).fill(0).map(()=>Array(k).fill(0)), hlA: ctx.getMatHl(0,k,0,k,'hl-divide'), hlB: ctx.getMatHl(0,k,0,k,'hl-divide'), hlC:{}, phase: 'divide', msg: `Divide: Strassen splitting matrices of size ${k} into 4 parts.`});

            let h = k / 2;
            let A11 = Array(h).fill(0).map(()=>Array(h)); let A12 = Array(h).fill(0).map(()=>Array(h)); let A21 = Array(h).fill(0).map(()=>Array(h)); let A22 = Array(h).fill(0).map(()=>Array(h));
            let B11 = Array(h).fill(0).map(()=>Array(h)); let B12 = Array(h).fill(0).map(()=>Array(h)); let B21 = Array(h).fill(0).map(()=>Array(h)); let B22 = Array(h).fill(0).map(()=>Array(h));
            
            for(let i=0; i<h; i++) for(let j=0; j<h; j++) { A11[i][j]=A[i][j]; A12[i][j]=A[i][j+h]; A21[i][j]=A[i+h][j]; A22[i][j]=A[i+h][j+h]; B11[i][j]=B[i][j]; B12[i][j]=B[i][j+h]; B21[i][j]=B[i+h][j]; B22[i][j]=B[i+h][j+h]; }

            steps.push({ type: 'matrix', A, B, C: Array(k).fill(0).map(()=>Array(k).fill(0)), hlA:{}, hlB:{}, hlC:{}, phase: 'conquer', msg: `Conquer: Recursively building the 7 Strassen products P1->P7...`});

            let P1 = strassenRec(A11, subMat(B12, B22));
            let P2 = strassenRec(addMat(A11, A12), B22);
            let P3 = strassenRec(addMat(A21, A22), B11);
            let P4 = strassenRec(A22, subMat(B21, B11));
            let P5 = strassenRec(addMat(A11, A22), addMat(B11, B22));
            let P6 = strassenRec(subMat(A12, A22), addMat(B21, B22));
            let P7 = strassenRec(subMat(A11, A21), addMat(B11, B12));

            let C11 = addMat(subMat(addMat(P5, P4), P2), P6);
            let C12 = addMat(P1, P2);
            let C21 = addMat(P3, P4);
            let C22 = subMat(subMat(addMat(P5, P1), P3), P7);

            let C = joinMat(C11, C12, C21, C22);
            steps.push({ type: 'matrix', A, B, C, hlA:{}, hlB:{}, hlC: ctx.getMatHl(0,k,0,k, 'hl-combine'), phase: 'combine', msg: `Combine: Reassembled 7 pieces into resulting size ${k} matrix!`});
            return C;
        }

        let CFinal = strassenRec(A, B);
        steps.push({ type: 'matrix', A, B, C: CFinal, hlA:{}, hlB:{}, hlC: ctx.getMatHl(0,n,0,n, 'hl-sorted'), phase: 'finish', msg: "Strassen's Multiplication Complete!", end: true });
        return steps;
    },

    /* --- GEOMETRY ALGORITHMS --- */

    // 7. Closest Pair of Points
    genClosestPair: function(numPts) {
        let steps = [];
        let pts = [];
        const w = 600, h = 300, pad = 30; // internal coordinate system
        for(let i=0; i<numPts; i++) pts.push({ id: i, x: Math.floor(Math.random()*(w - pad*2) + pad), y: Math.floor(Math.random()*(h - pad*2) + pad) });

        pts.sort((a,b) => a.x - b.x);
        steps.push({ type: 'geometry', points: [...pts], phase: 'divide', msg: `Generated ${numPts} points and pre-sorted by X-coordinate.` });

        function ptDist(p1, p2) { return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)); }

        function cpRec(P, GlobalPts) {
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

            let dL = cpRec(P.slice(0, mid), GlobalPts);
            let dR = cpRec(P.slice(mid), GlobalPts);

            let d = dL.d; let cp1 = dL.p1; let cp2 = dL.p2;
            if (dR.d < d) { d = dR.d; cp1 = dR.p1; cp2 = dR.p2; }

            steps.push({ type: 'geometry', points: GlobalPts, divider: midp.x, strip: {minX: midp.x - d, maxX: midp.x + d}, closest: [cp1, cp2], phase: 'combine', msg: `Combine: Resolving local min to ${d.toFixed(1)}px. Spawning cross-boundary strip.` });

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

        let res = cpRec(pts, [...pts]);
        steps.push({ type: 'geometry', points: [...pts], closest: [res.p1, res.p2], phase: 'finish', msg: `Closest pair exactly found with minimum distance!`, end: true });
        return steps;
    },

    // 8. Convex Hull
    genConvexHull: function(numPts) {
        let steps = [];
        let pts = [];
        const w = 600, h = 300, pad = 30;
        for(let i=0; i<numPts; i++) pts.push({ id: i, x: Math.floor(Math.random()*(w - pad*2) + pad), y: Math.floor(Math.random()*(h - pad*2) + pad) });

        steps.push({ type: 'geometry', points: [...pts], hull: [], phase: 'divide', msg: `Generated ${numPts} unstructured random points.` });

        function crossProd(A, B, C) { return -((B.x - A.x)*(C.y - A.y) - (B.y - A.y)*(C.x - A.x)); }

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

        function buildHull(S, GlobalPts, A, B, hull) {
            if (S.length === 0) return;

            let maxDist = -1; let C = null;
            let a = B.y - A.y; let b = A.x - B.x; let c = B.x * A.y - B.y * A.x;

            for (let p of S) {
                let dst = Math.abs(a * p.x + b * p.y + c) / Math.sqrt(a*a + b*b);
                if (dst > maxDist) { maxDist = dst; C = p; }
            }
            if (!C) return;
            
            hull.push(C);
            steps.push({ type: 'geometry', points: GlobalPts, hull: [...hull], lines: [{p1:A, p2:C, color: '#ffc107'}, {p1:C, p2:B, color: '#ffc107'}], phase: 'divide', msg: `Divide: Discovered furthest nodal triangle spanning sub-domain bounds.` });

            let sub1 = [], sub2 = [];
            for (let p of S) {
                if (p === C) continue;
                if (crossProd(A, C, p) > 0) sub1.push(p);
                else if (crossProd(C, B, p) > 0) sub2.push(p);
            }
            
            steps.push({ type: 'geometry', points: GlobalPts, hull: [...hull], hlPts: [...sub1, ...sub2], phase: 'conquer', msg: `Conquer: Recursively tracing isolated external sub-domains.` });

            buildHull(sub1, GlobalPts, A, C, hull);
            buildHull(sub2, GlobalPts, C, B, hull);
        }

        buildHull(s1, [...pts], minX, maxX, hullStrct);
        buildHull(s2, [...pts], maxX, minX, hullStrct);

        // Sorting hull so rendering visually traces a connected polygon path
        let cx = 0, cy = 0;
        hullStrct.forEach(p => { cx+=p.x; cy+=p.y; });
        cx/=hullStrct.length; cy/=hullStrct.length;
        hullStrct.sort((a,b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));

        steps.push({ type: 'geometry', points: [...pts], hull: hullStrct, phase: 'finish', msg: `Constructed Convex boundaries encompassing ${hullStrct.length} nodes!`, end: true });
        return steps;
    }
};
