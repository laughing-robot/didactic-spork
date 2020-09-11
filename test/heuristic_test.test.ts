import { Rect, Bin, FreeSpace, PlacedRect } from "~packing/bin";
import { constructBins, constructPlacedRects  } from "./pack_test_utils"

const delta : number = 1e-12;

describe('symmetric heuristic test', () => {

    test('empty_assess_block tests', () => {
        let binDims = [ [20, 10], [10, 20] ];

        let proposalDims = [
            [ [6, 2, 8, 6], [7, 2, 8, 6], [5, 2, 8, 6], [1, 1, 3, 3] ],
            [ [2, 6, 6, 8], [2, 7, 6, 8], [2, 5, 6, 8] ],
        ];

        let bins : Bin[] = constructBins(binDims, []);
        let results = proposeBin(bins[0], constructPlacedRects(proposalDims)[0]);

        // x - symmetry assessment
        expect(isEqual(results[0][0], 1)).toBeTruthy();
        expect(isEqual(results[0][1], 1)).toBeTruthy();

        expect(isEqual(results[1][1], 1)).toBeTruthy();
        expect(isEqual(results[2][1], 1)).toBeTruthy();
        expect(isGreater(results[0][0], results[1][0])).toBeTruthy();
        expect(isEqual(results[1][0], results[2][0])).toBeTruthy();

        expect(isZero(results[3][0])).toBeTruthy();
        expect(isZero(results[3][1])).toBeTruthy();

        results = proposeBin(bins[1], constructPlacedRects(proposalDims)[1]);

        // y - symmetry assessment
        expect(isEqual(results[0][0], 1)).toBeTruthy();
        expect(isEqual(results[0][1], 1)).toBeTruthy();

        expect(isEqual(results[1][0], 1)).toBeTruthy();
        expect(isEqual(results[2][0], 1)).toBeTruthy();
        expect(isGreater(results[0][1], results[1][1])).toBeTruthy();
        expect(isEqual(results[1][1], results[2][1])).toBeTruthy();

    });

    test('self-fulfilling symmetry block', () => {
        let binDims = [ [20, 20] ];
        let rectDims = [ 
            [ [9, 9, 2, 2] ] 
        ];

        let bins : Bin[] = constructBins(binDims, [], rectDims);
        let mlist : number[] = bins[0].getHeuristics();

        expect(isZero(mlist[0])).toBeTruthy();
        expect(isZero(mlist[1])).toBeTruthy();
    });

    test('symmetry balanced_assess_block', () => {
        let binDims = [ [20, 20] ];
        let rectDims = [ 
            [ [9, 9, 2, 2] ] 
        ];

        let proposalDims = [
            [[9, 9, 2, 2], [10, 9, 2, 2], [11, 9, 2, 2], [11, 11, 2, 2] ]
        ];

        let bins : Bin[] = constructBins(binDims, [], rectDims);
        let results = proposeBin(bins[0], constructPlacedRects(proposalDims)[0]);

        expect(isEqual(results[0][0], 1)).toBeTruthy();
        expect(isEqual(results[0][0], results[0][1])).toBeTruthy();

        expect(isEqual(results[1][1], 1)).toBeTruthy();
        expect(isEqual(results[2][1], 1)).toBeTruthy();

        expect(isLess(results[1][0], results[1][1])).toBeTruthy();
        expect(isLess(results[2][0], results[1][0])).toBeTruthy();
        expect(isEqual(results[3][0], results[2][0])).toBeTruthy();
        expect(isEqual(results[3][0], results[3][1])).toBeTruthy();
    });

    test('symmetry satisfying_assess_block', () => {
        let binDims = [ [20, 10], [20, 10] ];
        let rectDims = [
            [ [2, 5, 10, 4], [1, 0, 6, 4.5] ],
            [ [1, 1, 6, 3], [ 13, 6, 6, 3] ]
        ];

        let proposalDims = [
            [ [9, 4, 2, 2], [0, 4.5, 6, 0.5], [12, 4.5, 6, 0.5]],
            [ [1, 6, 6, 3], [13, 1, 6, 3] ]
        ];

        let bins : Bin[] = constructBins(binDims, [], rectDims);
        let results = proposeBin(bins[0], constructPlacedRects(proposalDims)[0]);

        // bin 1
        expect(isGreaterThanOrEqual(results[0][0], 1)).toBeTruthy();
        expect(isGreaterThanOrEqual(results[0][1], 1)).toBeTruthy();
        expect(isLess(results[1][0], results[2][0]));
        expect(isGreater(results[1][1], results[2][1]));

        results = proposeBin(bins[1], constructPlacedRects(proposalDims)[1]);

        // bin 2
        expect(isGreaterThanOrEqual(results[0][0], 1)).toBeTruthy();
        expect(isGreaterThanOrEqual(results[0][1], 1)).toBeTruthy();
    });

    test('perfect xy-symmetry with two rects', () => {
        let binDims = [ [20, 10] ];
       let rectDims = [ 
           [ [8, 4, 2, 2], [10, 4, 2, 2], [2, 3, 4, 4], [14, 3, 4, 4] ] 
       ];

       let bins : Bin[] = constructBins(binDims, [], rectDims);
       let mlist : number[] = bins[0].getHeuristics();

       expect(isZero(mlist[0])).toBeTruthy();
       expect(isZero(mlist[1])).toBeTruthy();
    });

    test('perfect y-symmetry, imperfect x-symmetry', () => {
        let binDims = [ [20, 10] ];
        let rectDims = [ 
            [ [0, 2, 8, 5], [12, 2, 8, 5] ] 
        ];

        let bins : Bin[] = constructBins(binDims, [], rectDims);
        let mlist : number[] = bins[0].getHeuristics();

        expect(isZero(mlist[0])).toBeTruthy();
        expect(isZero(mlist[1])).toBeFalsy();
    });


    test('perfect x-symmetry, imperfect y-symmetry', () => {
        let binDims = [ [20, 10] ];
        let rectDims = [ 
            [ [0, 1, 8, 3], [0, 6, 8, 3] ] 
        ];

        let bins : Bin[] = constructBins(binDims, [], rectDims);
        let mlist : number[] = bins[0].getHeuristics();

        expect(isZero(mlist[0])).toBeFalsy();
        expect(isZero(mlist[1])).toBeTruthy();
    });

    test('symmetry_offset_x testing', () => {

        let binDims = [ [20, 10], [20, 10], [20, 10], [20, 10] ];
        let rectDims = [ 
            [ [2, 3, 6, 4], [12, 3, 6, 4] ],  // gold standard
            [ [3.5, 3, 6, 4], [12, 3, 6, 4] ],  // mild x-offset
            [ [5, 3, 6, 4], [12, 3, 6, 4] ],  // significant x-offset 
            [ [12, 3, 6, 4] ],  // fully imbalanced
        ];

        let bins : Bin[] = constructBins(binDims, [], rectDims);
        let hresults : number[][] =  evaluateBins(bins);


        // gold standard
        expect(isZero(hresults[0][0])).toBeTruthy();
        expect(isZero(hresults[0][1])).toBeTruthy();

        //compare others
        for(let i = 1; i < hresults.length; ++i) {
            expect(isLess(hresults[i-1][0], hresults[i][0])).toBeTruthy();
            expect(isEqual(hresults[i-1][1], hresults[i][1])).toBeTruthy();
        };

    });

    test('symmetry_offset_y testing', () => {

        let binDims = [ [20, 10], [20, 10], [20, 10], [20, 10] ];
        let rectDims = [ 
            [ [7, 1, 6, 2], [7, 7, 6, 2] ],  // gold standard
            [ [7, 2, 6, 2], [7, 7, 6, 2] ],  // mild y-offset
            [ [7, 3, 6, 2], [7, 7, 6, 2] ],  // large y-offset 
            // [ [7, 4, 6, 2], [7, 7, 6, 2] ],  // offset but first painting self-cancels
            [ [7, 5, 6, 2], [7, 7, 6, 2] ],  // massive y-offset 
            [ [7, 7, 6, 2] ],  // fully imbalanced
        ];

        let bins : Bin[] = constructBins(binDims, [], rectDims);
        let hresults : number[][] =  evaluateBins(bins);


        // gold standard
        expect(isZero(hresults[0][0])).toBeTruthy();
        expect(isZero(hresults[0][1])).toBeTruthy();

        //compare others
        for(let i = 1; i < hresults.length; ++i) {
             expect(isLess(hresults[i-1][1], hresults[i][1])).toBeTruthy();
             expect(isEqual(hresults[i-1][0], hresults[i][0])).toBeTruthy();
         };
     });

});

describe("Center Mass tests", () => {
    test('balanced center mass', () => {

    });
});

function isZero(val : number) {
    return isEqual(val, 0);
}

function isEqual(val1 : number, val2 : number) {
    return Math.abs(val1 - val2) < delta;
}

function isGreater(val1 : number, val2 : number) {
    return val1 - val2 >  delta;
}

function isLess(val1 : number, val2 : number) {
    return val2 - val1 >  delta;
}

function isGreaterThanOrEqual(val1 : number, val2 : number) {
    return isGreater(val1, val2) || isEqual(val1, val2);
}

function isLessThanOrEqual(val1 : number, val2 : number) {
    return isLess(val1, val2) || isEqual(val1, val2);
}

function evaluateBins(bins : Bin[]) {
    let heuristic_values : number[][] = [];

    bins.forEach((bin) => { let bin_val = [];

        heuristic_values.push(bin.getHeuristics());
    }, this);

    return heuristic_values;
}


function proposeBin(bin : Bin, rects : PlacedRect[]) : number[][] {
    let results = [];

    rects.forEach((rect) => {
        results.push(bin.getAssessment(rect));
    }, this);

    return results;
}