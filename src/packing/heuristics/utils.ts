import { Bin, PlacedRect } from "~packing/bin"

export interface Square {
    row : number;
    col : number;
}

export interface Heuristic {
    assessBlock : Function;
    evaluate : Function;
}

export interface BinGridHeuristic extends Heuristic {
    updateGrid(grid : BinGrid, rect : PlacedRect) : void; // in-place update
    assessGrid(grid : BinGrid, rects : PlacedRect[]) : number; // out-place evaluation
    assessBlock(grid : BinGrid, block : PlacedRect) : number; // out-place evaluation
    evaluate(grid : BinGrid) : number; // does an in-place assessment
}

export class BinGridArray {
    grids : Array<BinGrid>;
    funcs : Array<BinGridHeuristic>;
    bin : Bin;

    constructor(bin, funcs, increment) {
        this.funcs = funcs;
        this.bin = bin;
        this.grids = Array.from({length: funcs.length}, () => {return new BinGrid(bin.w, bin.h, increment)}); //this is how many levels
    }


    get(level : number) {
        return this.grids[level];
    }

    update(rect : PlacedRect) {
        this.funcs.forEach((func, i) => {
            func.updateGrid(this.grids[i], rect);
        }, this);
    }

    evaluate() {
        let result = [];

        this.funcs.forEach((func, i) => {
            result.push(func.evaluate(this.grids[i]));
        });

        return result;
    }
}

export class BinGrid {

    map : number[][];
    increment : number;
    h : number;
    w : number;

    constructor(w = 1.0, h = 1.0, increment = 0.1) {
        if (w/increment % 1 != 0 || h/increment % 1 != 0) throw "construction failed due to uneven division by increment";

        this.map = Array.from(Array(w/increment), () => new Array(h/increment).fill(0));
        this.increment = increment;
        this.h = this.map[0].length;
        this.w = this.map.length;
    }

    get(square : Square) : number {
        return this.map[square.row][square.col];
    }

    set(square : Square, val) : void {
        this.map[square.row][square.col] = val;
    }

    /**
     * Fetches box and resolves box border dispute using isLower parameter
     */
    getBox(val, isLower = false) {
        return (Math.round(val / this.increment) + Number(isLower)) - 1;
    }

    getSquare(rect : PlacedRect) : Square[] {
        return [ {row : this.getBox(rect.x0, true), col : this.getBox(rect.y0, true)}, 
                {row : this.getBox(rect.xe), col : this.getBox(rect.ye)} ];
    }

    getBounds() : Square[] {
        return [
            {row: 0, col : 0}, {row: this.map.length - 1, col : this.map[0].length - 1}
        ];
    }

    inBounds(square : Square) {
        return square.row > 0 && square.row < this.w && square.col > 0 && square.col < this.h;
    }

    bindRow(val : number) : number {
        return Math.max(0, Math.min(val, this.w - 1));
    }

    bindCol(val : number) : number {
        return Math.max(0, Math.min(val, this.h - 1));
    }

    tally(squares : Square[], numType = 0) : number {
        let total = 0;

        for(let i = squares[0].row; i <= squares[1].row; ++i)
            for(let j = squares[0].col; j <= squares[1].col; ++j) {
                let num = this.map[i][j];

                total += num * Number(num*numType >= 0);
            }

        return total;
    }

    copy(grid : BinGrid) : BinGrid {
        if (this.h != grid.h || this.w != grid.w) throw "copy failed due to noncongruent dimensions";
        for(let i = 0; i < grid.w; ++i) {
            for(let j = 0; j < grid.h; ++j) {
                this.map[i][j] = grid.map[i][j];
            }
        }

        return this;
    }

}

/**
* Creates a fading gradient square about a given point based on the Manhattan Distance and the gradient
*
*/
function applyManhattanFade(gridarray : BinGrid[], square : Square, radius : number, val : number = 0.5, fadeFunc) {

    for(let i = -1 * radius; Math.abs(i) <= radius; ++i) {
        for(let j = Math.abs(i) - radius; Math.abs(j) <= radius - Math.abs(i); ++j) {

            let nsquare  = { row : square.row + i, col : square.col + j };

            if(gridarray[0].inBounds(nsquare)) { 
                fadeFunc(nsquare, gridarray, val, Math.abs(i) + Math.abs(j));                
            }
        }
    }
}

/**
* Marks all squares between two squares and applies a faded gradient on edges as decided
*
*/
export function markSquare(grid : BinGrid, rect : PlacedRect, val : number) {
    let [ square1, square2 ] = grid.getSquare(rect);

    for(let i = square1.row; i <= square2.row; ++i) {
        for(let j = square1.col; j <= square2.col; ++j) {
            grid.set({row : i, col : j}, val); 
        }
    }
}


export function markFadingSquareBetween(grid : BinGrid, rect : PlacedRect, extension : number = 150, applyTo: Function, applyToEdge : Function) {

    let [ square1, square2 ] = grid.getSquare(rect);

    for(let i = grid.bindRow(square1.row - extension); i <= grid.bindRow(square2.row + extension); ++i) {
        for(let j = grid.bindCol(square1.col - extension); j <= grid.bindCol(square2.col + extension); ++j) {
            if (i < square1.row || i > square2.row || j < square1.col || j > square2.col) { // if in the 'shadow' of the square
                let distToRealSquare = (i - square2.row) * Number(i > square2.row) + (square1.row - i) * Number(i < square1.row) 
                    + (j - square2.col) * Number(j > square2.col) + (square1.col - j) * Number(j < square1.col);

                if(applyToEdge != null) applyToEdge(grid, {row : i, col : j}, distToRealSquare);
            }
            else {
                applyTo(grid, {row : i, col : j});
            }
        }
    }
}

