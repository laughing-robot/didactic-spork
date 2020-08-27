import { Bin, PlacedRect } from "~packing/bin";
import { BinGrid, Square } from "~/packing/heuristic_utils"

/**
 * function to compute the symmetry of images over X axis
*/
export function computeXYSymmetry(bin : Bin, placedRect : PlacedRect[], increment = 0.1, val = 1.0, fadeRadius = 5) {
    return computeSymmetry([ reflectSquareOverX, reflectSquareOverY ], bin, placedRect, increment, val, fadeRadius);
}


/**
* iterate through all squares and mark in a boolean array
*
*/
function computeSymmetry(symFuncList : Function[], bin : Bin, placedRects : PlacedRect[], increment = 0.1, val = 1.0, fadeRadius = 10) {

    let gridarray = Array.from({length: symFuncList.length}, () => {return new BinGrid(bin.w, bin.h, increment)}); //this is how many levels

    const context = {symFuncList : symFuncList, val : val}; // contextual parameters for function params

    let centerFunc = function (gridarray, square) {

        this.symFuncList.forEach((symFunc, i) => {
            let grid = gridarray[i];
            let reflectedSquare = symFunc(grid, square);

            grid.set(square, grid.get(square) + this.val);
            grid.set(reflectedSquare, grid.get(reflectedSquare) - this.val);
        }, this);

    };

    let edgeFunc = function (gridarray, square, distToSquare) {

         this.symFuncList.forEach((symFunc, i) => {
             let grid = gridarray[i];
             let symSquare = symFunc(grid, square);

             let delta = this.val/2.0/distToSquare;
             grid.set(square, grid.get(square) + delta);
             grid.set(symSquare, grid.get(symSquare) - delta);

             }, this);
    };


    placedRects.forEach((rect, i) => {

        let [ square0, squareE ] = gridarray[0].getSquare(rect);

        markFadingSquareBetween(gridarray, square0, squareE, 200, centerFunc.bind(context), edgeFunc.bind(context));
    }, this);

    return gridarray.map((grid) => { 
        return grid.map.reduce((total, arr : number[]) => { 
            return total +  arr.reduce((total, num : number) => { return total + num * Number(num > 0) }, 0); 
        }, 0);
    });
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
function markSquareBetween(gridarray : BinGrid[], square1 : Square, square2 : Square, applyTo : Function, applyToEdge : Function) {

    for(let i = square1.row; i <= square2.row; ++i) {
        for(let j = square1.col; j <= square2.col; ++j) {
            if(applyToEdge != null && (i == square1.row || i == square2.row || j == square2.col || j == square1.col)) { // if on edge of square
                applyToEdge(gridarray, {row : i, col : j});
            }
            else {
                applyTo(gridarray, {row : i, col : j});
            }
        }
    }
}


/**
 * 
 *
 */
function markFadingSquareBetween(gridarray : BinGrid[], square1 : Square, square2 : Square, extension : number = 150, applyTo: Function, applyToEdge : Function) {

    let grid = gridarray[0];

    for(let i = grid.bindRow(square1.row - extension); i <= grid.bindRow(square2.row + extension); ++i) {
        for(let j = grid.bindCol(square1.col - extension); j <= grid.bindCol(square2.col + extension); ++j) {

            if (i < square1.row || i > square2.row || j < square1.col || j > square2.col) { // if in the 'shadow' of the square
                let distToRealSquare = (i - square2.row) * Number(i > square2.row) + (square1.row - i) * Number(i < square1.row) 
                    + (j - square2.col) * Number(j > square2.col) + (square1.col - j) * Number(j < square1.col);

                if(applyToEdge != null) applyToEdge(gridarray, {row : i, col : j}, distToRealSquare);
            }
            else {
                applyTo(gridarray, {row : i, col : j});
            }
        }
    }
}

function bound(val, cap) {
    return Math.min(Math.max(val, cap[0]), cap[1]);
}
