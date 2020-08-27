import { Rect, Bin, FreeSpace, PlacedRect } from "~packing/bin";
import { constructBins  } from "./pack_test_utils"

describe('symmetric heuristic test', () => {

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
            expect(hresults[i-1][0] < hresults[i][0]).toBeTruthy();
            expect(hresults[i-1][1] == hresults[i][1]).toBeTruthy();
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
             expect(hresults[i-1][1] < hresults[i][1]).toBeTruthy();
             expect(hresults[i-1][0] == hresults[i][0]).toBeTruthy();
         };

     });

});

function isZero(val : number) {
    return val < 0.000001 && val > -0.0000001;
}

function evaluateBins(bins : Bin[]) {
    let heuristic_values : number[][] = [];

    bins.forEach((bin) => {
        let bin_val = [];

        heuristic_values.push(bin.getHeuristics());
    }, this);

    return heuristic_values;
}
