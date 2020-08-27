import { Bin, PlacedRect } from "~packing/bin";
import { BinGridHeuristic, BinGrid, Square, markFadingSquareBetween } from "~/packing/heuristics/utils"


class SymmetryHeuristic implements BinGridHeuristic {
        
    val : number;
    extension : number;
    symFunc : Function;

    constructor(symFunc, val = 1.0, extension = 100) {
        this.val = val;
        this.extension = extension;
        this.symFunc = symFunc;
    }

    updateGrid(grid : BinGrid, rect : PlacedRect) {
        let context = {symFunc: this.symFunc, val : this.val};

        let centerFunc = function (grid, square) {
            let reflectedSquare = this.symFunc(grid, square);
            grid.set(square, grid.get(square) + this.val);
            grid.set(reflectedSquare, grid.get(reflectedSquare) - this.val);

        };

        let edgeFunc = function (grid, square, distToSquare) {
            let symSquare = this.symFunc(grid, square);
            let delta = this.val/2.0/distToSquare;

            grid.set(square, grid.get(square) + delta);
            grid.set(symSquare, grid.get(symSquare) - delta);

        };

        markFadingSquareBetween(grid, rect, this.extension, centerFunc.bind(context), edgeFunc.bind(context));
    }

    assessGrid(grid : BinGrid, rects : PlacedRect[]) {
        let newgrid = new BinGrid().copy(grid);
        
        rects.forEach((rect) => {
            this.updateGrid(newgrid, rect);
        });

        return this.evaluate(newgrid);
    }

    evaluate(grid : BinGrid) {
        return grid.map.reduce((total, arr : number[]) => { 
                return total +  arr.reduce((total, num : number) => { return total + num * Number(num > 0) }, 0); 
            }, 0);
    }
}

export class YSymmetryHeuristic extends SymmetryHeuristic {
    constructor(val = 1.0, extension = 100) {
        super(reflectSquareOverY, val, extension);
    }
}

export class XSymmetryHeuristic extends SymmetryHeuristic {
    constructor(val = 1.0, extension = 100) {
        super(reflectSquareOverX, val, extension);
    }
}


/**
 * Retrieves the square as reflected over the y midline of the bin
 *
 */
function reflectSquareOverY(grid : BinGrid, square : Square) {
    let map = grid.map;
    let mid : number = (grid.h - 1) / 2;

    let reflectedCol : number = mid + (mid - square.col);
    reflectedCol = Math.floor(reflectedCol);
    
    return { row: square.row, col : reflectedCol };
}

/**
 * Retrieves the square as reflected over the x midline of the bin
 *
 */
function reflectSquareOverX(grid : BinGrid, square : Square) {
    let map = grid.map;
    let mid : number = (grid.w - 1) / 2;

    let reflectedRow : number = mid + (mid - square.row);
    reflectedRow = Math.floor(reflectedRow);

    return { row: reflectedRow, col : square.col };
}
