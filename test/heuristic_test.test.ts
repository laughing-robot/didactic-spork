import { Rect, Bin, FreeSpace, PlacedRect } from "~packing/bin";
import { constructBins, constructPlacedRects  } from "./pack_test_utils"
import { EuclideanDistance, Point } from "~utils";

const delta : number = 1e-12;

describe('symmetric heuristic test', () => {

    test('symmetry:_empty_assess_block', () => {
        let binDims = [ [20, 10], [10, 20] ];

        let proposalDims = [
            [ [6, 2, 8, 6], [7, 2, 8, 6], [5, 2, 8, 6], [1, 1, 3, 3] ],
            [ [2, 6, 6, 8], [2, 7, 6, 8], [2, 5, 6, 8] ],
        ];

        let bins : Bin[] = constructBins(binDims, []);
        let results = proposeBlock(bins[0], constructPlacedRects(proposalDims)[0]);

        // x - symmetry assessment
        expect(isEqual(results[0][0], 1)).toBeTruthy();
        expect(isEqual(results[0][1], 1)).toBeTruthy();

        expect(isEqual(results[1][1], 1)).toBeTruthy();
        expect(isEqual(results[2][1], 1)).toBeTruthy();
        expect(isGreater(results[0][0], results[1][0])).toBeTruthy();
        expect(isEqual(results[1][0], results[2][0])).toBeTruthy();

        expect(isZero(results[3][0])).toBeTruthy();
        expect(isZero(results[3][1])).toBeTruthy();

        results = proposeBlock(bins[1], constructPlacedRects(proposalDims)[1]);

        // y - symmetry assessment
        expect(isEqual(results[0][0], 1)).toBeTruthy();
        expect(isEqual(results[0][1], 1)).toBeTruthy();

        expect(isEqual(results[1][0], 1)).toBeTruthy();
        expect(isEqual(results[2][0], 1)).toBeTruthy();
        expect(isGreater(results[0][1], results[1][1])).toBeTruthy();
        expect(isEqual(results[1][1], results[2][1])).toBeTruthy();

    });

    test('symmetry:_satisfied_block', () => {
        let binDims = [ [20, 20] ];
        let rectDims = [ 
            [ [9, 9, 2, 2] ] 
        ];

        let bins : Bin[] = constructBins(binDims, [], rectDims);
        let mlist : number[] = bins[0].getHeuristics();

        expect(isOne(mlist[0])).toBeTruthy();
        expect(isOne(mlist[1])).toBeTruthy();
    });

    test('symmetry:_balanced_assess_block', () => {
        let binDims = [ [20, 20] ];
        let rectDims = [ 
            [ [9, 9, 2, 2] ] 
        ];

        let proposalDims = [
            [[9, 9, 2, 2], [10, 9, 2, 2], [11, 9, 2, 2], [11, 11, 2, 2] ]
        ];

        let bins : Bin[] = constructBins(binDims, [], rectDims);
        let results = proposeBlock(bins[0], constructPlacedRects(proposalDims)[0]);

        expect(isEqual(results[0][0], 1)).toBeTruthy();
        expect(isEqual(results[0][0], results[0][1])).toBeTruthy();

        expect(isEqual(results[1][1], 1)).toBeTruthy();
        expect(isEqual(results[2][1], 1)).toBeTruthy();

        expect(isLess(results[1][0], results[1][1])).toBeTruthy();
        expect(isLess(results[2][0], results[1][0])).toBeTruthy();
        expect(isEqual(results[3][0], results[2][0])).toBeTruthy();
        expect(isEqual(results[3][0], results[3][1])).toBeTruthy();
    });

    test('symmetry:_satisfied_assess_block', () => {
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
        let results = proposeBlock(bins[0], constructPlacedRects(proposalDims)[0]);

        // bin 1
        expect(isGreaterThanOrEqual(results[0][0], 1)).toBeTruthy();
        expect(isGreaterThanOrEqual(results[0][1], 1)).toBeTruthy();
        expect(isLess(results[1][0], results[2][0]));
        expect(isGreater(results[1][1], results[2][1]));

        results = proposeBlock(bins[1], constructPlacedRects(proposalDims)[1]);

        // bin 2
        expect(isGreaterThanOrEqual(results[0][0], 1)).toBeTruthy();
        expect(isGreaterThanOrEqual(results[0][1], 1)).toBeTruthy();
    });

    test('symmetry:_balanced_xy-symmetry', () => {
        let binDims = [ [20, 10] ];
       let rectDims = [ 
           [ [8, 4, 2, 2], [10, 4, 2, 2], [2, 3, 4, 4], [14, 3, 4, 4] ] 
       ];

       let bins : Bin[] = constructBins(binDims, [], rectDims);
       let mlist : number[] = bins[0].getHeuristics();

       expect(isOne(mlist[0])).toBeTruthy();
       expect(isOne(mlist[1])).toBeTruthy();
    });

    test('symmetry:_sym_x_sym_y', () => {
        let binDims = [ [20, 10] ];
        let rectDims = [ 
            [ [0, 2, 8, 5], [12, 2, 8, 5] ] 
        ];

        let bins : Bin[] = constructBins(binDims, [], rectDims);
        let mlist : number[] = bins[0].getHeuristics();

        expect(isOne(mlist[0])).toBeTruthy();
        expect(isOne(mlist[1])).toBeFalsy();
    });


    test('symmetry:_sym_x_non-sym_y', () => {
        let binDims = [ [20, 10] ];
        let rectDims = [ 
            [ [0, 1, 8, 3], [0, 6, 8, 3] ] 
        ];

        let bins : Bin[] = constructBins(binDims, [], rectDims);
        let mlist : number[] = bins[0].getHeuristics();

        expect(isOne(mlist[0])).toBeFalsy();
        expect(isOne(mlist[1])).toBeTruthy();
    });

    test('symmetry:_offset_x', () => {

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
        expect(isOne(hresults[0][0])).toBeTruthy();
        expect(isOne(hresults[0][1])).toBeTruthy();

        //compare others
        for(let i = 1; i < hresults.length; ++i) {
            expect(isGreater(hresults[i-1][0], hresults[i][0])).toBeTruthy();
            expect(isEqual(hresults[i-1][1], hresults[i][1])).toBeTruthy();
        };

    });

    test('symmetry:_offset_y', () => {

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
        expect(isOne(hresults[0][0])).toBeTruthy();
        expect(isOne(hresults[0][1])).toBeTruthy();

        //compare others
        for(let i = 1; i < hresults.length; ++i) {
             expect(isGreater(hresults[i-1][1], hresults[i][1])).toBeTruthy();
             expect(isEqual(hresults[i-1][0], hresults[i][0])).toBeTruthy();
         };
     });

});

describe("Center Mass tests", () => {

    let binDims = [ [20, 10], [20, 10], [20, 10], [20, 10], [20, 10] ];
    let rectDims = [ 
        [], //empty
        [ [5, 8, 4, 2], [0, 5, 3, 3.5] ], //top left
        [ [ 0, 1, 4.5, 4 ], [5, 2, 2, 4], [8, 0, 2, 5], [7, 7, 2, 2] ], //bottom left 
        [ [11, 5, 2, 2], [12, 8, 3, 2], [15, 6, 4, 2], [17, 8.5, 3, 1], [4, 2, 1, 1], [8, 7, 2, 2] ], //top right
        [ [10.5, 0.5, 6, 4], [13, 5, 2, 2], [18, 1, 2, 4], [7, 3, 2.5, 8] ] //bottom right
    ];

    let bins : Bin[] = constructBins(binDims, [], rectDims);

    test('cm:_empty', () => {
       let results = bins[0].getHeuristics();
       console.log(results);
       expect(isOne(results[2])).toBeTruthy();

       let proposalDims = [
        [ [9, 4, 2, 2], [9, 5, 2, 2], [9, 6, 2, 2], [9, 7, 2, 2], [9, 8, 2, 2], [12, 8, 2, 2], [0, 0, 8, 8], [6, 0, 8, 8] ]
       ];

       let proposals = constructPlacedRects(proposalDims);
       let assessment = proposeBlock(bins[0], proposals[0]);

        
        for(let i = 0; i < 4; ++i) {
            expect(isGreater(assessment[i][2], assessment[i+1][2])).toBeTruthy();
        }
       expect(isGreater(assessment[7][2], assessment[6][2])).toBeTruthy();

    });

    test('cm:_top_left_imbalanced_evaluate', () => {
        // 3.87837, 7.7229
        let results = bins[1].getHeuristics();
        expect(isWithin(results[2], computeCMVal(6.69989091455, bins[1]), 1e-5)).toBeTruthy();


        let proposalDims = [
            [ [4, 7.5, 1, 0.5], [4, 2.75, 1, 0.5], [16, 2.75, 1, 0.5], [16, 7.5, 1, 0.5] ]
        ];

        let proposals = constructPlacedRects(proposalDims);
        let assessment = proposeBlock(bins[1], proposals[0]);

        expect(isLess(assessment[0][2], assessment[1][2])).toBeTruthy();
        expect(isLess(assessment[1][2], assessment[2][2])).toBeTruthy();
        expect(isLess(assessment[3][2], assessment[2][2])).toBeTruthy();
        expect(isLess(assessment[1][2], assessment[3][2])).toBeTruthy();
    });

    test('cm:_bottom_left_imbalanced_evaluate', () => {
        // 5.2625, 3.575
        let results = bins[2].getHeuristics();
        expect(isWithin(computeCMVal(4.947174, bins[2]), results[2], 1e-5)).toBeTruthy();

        let proposalDims = [
            [ [4, 7.5, 1, 0.5], [4, 2.75, 1, 0.5], [16, 2.75, 1, 0.5], [16, 7.5, 1, 0.5] ]
        ];

        let proposals = constructPlacedRects(proposalDims);
        let assessment = proposeBlock(bins[2], proposals[0]);

        expect(isGreater(assessment[3][2], assessment[2][2])).toBeTruthy();
        expect(isGreater(assessment[3][2], assessment[0][2])).toBeTruthy();
        expect(isGreater(assessment[2][2], assessment[0][2])).toBeTruthy();
        expect(isGreater(assessment[0][2], assessment[1][2])).toBeTruthy();
    });

    test('cm:_top_right_imbalanced_evaluate', () => {
        //13.884615, 7.519230769  
        let results = bins[3].getHeuristics();
        expect(isWithin(results[2], computeCMVal(4.629984, bins[3]), 1e-5)).toBeTruthy();

        let proposalDims = [
            [ [4, 7.5, 1, 0.5], [4, 2.75, 1, 0.5], [16, 2.75, 1, 0.5], [16, 7.5, 1, 0.5] ]
        ];

        let proposals = constructPlacedRects(proposalDims);
        let assessment = proposeBlock(bins[3], proposals[0]);

        expect(isGreater(assessment[1][2], assessment[0][2])).toBeTruthy();
        expect(isGreater(assessment[1][2], assessment[2][2])).toBeTruthy();
        expect(isGreater(assessment[0][2], assessment[2][2])).toBeTruthy();
        expect(isGreater(assessment[2][2], assessment[3][2])).toBeTruthy();
    });

    test('cm:_bottom_right_imbalanced_evaluate', () => {
        // 12.44642857143, 4.42857142857 
        let results = bins[4].getHeuristics();
        expect(isWithin(results[2], computeCMVal(2.51227852, bins[4]), 1e-5)).toBeTruthy();

        let proposalDims = [
            [ [4, 7.5, 1, 0.5], [4, 2.75, 1, 0.5], [16, 2.75, 1, 0.5], [16, 7.5, 1, 0.5] ]
        ];

        let proposals = constructPlacedRects(proposalDims);
        let assessment = proposeBlock(bins[4], proposals[0]);

        expect(isGreater(assessment[0][2], assessment[1][2])).toBeTruthy();
        expect(isGreater(assessment[0][2], assessment[3][2])).toBeTruthy();
        expect(isGreater(assessment[1][2], assessment[3][2])).toBeTruthy();
        expect(isGreater(assessment[3][2], assessment[2][2])).toBeTruthy();
    });

});


function isZero(val : number) {
    return isEqual(val, 0);
}

function isOne(val : number) {
    return isEqual(val, 1);
}

function isEqual(val1 : number, val2 : number) {
    return Math.abs(val1 - val2) < delta;
}

function isWithin(val1 : number, val2 : number, delta : number) {
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

function computeCMVal(center_val : number, bin : Bin) {
    return 1 - center_val * 2 / EuclideanDistance(new Point(0, 0), new Point(bin.w, bin.h));
}

function evaluateBins(bins : Bin[]) {
    let heuristic_values : number[][] = [];

    bins.forEach((bin) => { let bin_val = [];

        heuristic_values.push(bin.getHeuristics());
    }, this);

    return heuristic_values;
}

function proposeBlock(bin : Bin, rects : PlacedRect[]) : number[][] {
    let results = [];

    rects.forEach((rect) => {
        results.push(bin.getAssessment(rect));
    }, this);

    return results;
}
