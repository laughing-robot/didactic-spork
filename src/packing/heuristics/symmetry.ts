import { Bin, PlacedRect } from "~packing/bin";
import { BinGrid, Square, markFadingSquareBetween, markSquare, getSize, Heuristic } from "~/packing/heuristics/utils"


class SymmetryHeuristic implements Heuristic {
        
    val : number;
    extension_percent : number;
    increment : number;
    symFunc : Function;
    binGrid : BinGrid;
    bin : Bin;

    constructor(symFunc, increment = 0.1, val = 1.0, extension = 0.15) {
        this.symFunc = symFunc;
        this.val = val;
        this.extension_percent = extension;
    }

    init(bin : Bin) {
        this.bin = bin;
        this.binGrid = new BinGrid(bin.w, bin.h, this.increment); 

        return this;
    }
    
    assessBlock(block : PlacedRect) : number {
        return this.assessGridBlock(this.binGrid, block);
    }

    update(rect : PlacedRect) {
        this.updateGrid(this.binGrid, rect);
    }

    evaluate() : number {
        return this.evaluateGrid(this.binGrid);
    }

    evaluateGrid(grid : BinGrid) {
        return grid.tally(grid.getBounds(), 1);
    }

    assessGridBlock(grid : BinGrid, block : PlacedRect) : number {
        let newgrid = new BinGrid().scale(grid); 

        let [ square1, square2 ] = newgrid.getSquare(block);
        let squareArea : number = getSize([square1, square2]);

        this.updateGrid(newgrid, block); 
        let uncancelled = Math.min(1, newgrid.tally([square1, square2], 1) / squareArea);

        //IDEA: union-find islands of negatives and take that into consideration
        // the size of the islands will help decide which squares are better
        newgrid.copy(grid);
        let enemies_covered = newgrid.tally([square1, square2], -1);

        return (1-uncancelled) + Math.abs(enemies_covered) / squareArea;
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

        markFadingSquareBetween(grid, rect, this.extension_percent, centerFunc.bind(context), edgeFunc.bind(context));
    }
}

export class YSymmetryHeuristic extends SymmetryHeuristic {
    constructor(val = 1.0, extension = 0.15, increment = 0.1) {
        super(reflectSquareOverY, increment, val, extension);
    }
}

export class XSymmetryHeuristic extends SymmetryHeuristic {
    constructor(val = 1.0, extension = 0.15, increment = 0.1) {
        super(reflectSquareOverX, increment, val, extension);
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
