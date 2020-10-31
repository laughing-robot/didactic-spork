import { Rect, Bin, PlacedRect, FreeSpace } from "~packing/bin"
import { EdgeList } from "~packing/edgeList"
import { isOverlap } from "~packing/packing_utils"
import { Heuristic } from "~packing/heuristics/utils";
import  msg from "./msg"

export function verifyPacking(mbins) {
    // verify uniqueness of ids
    expect(areUnique(mbins), msg.get()).toBeTruthy();
    expect(inBounds(mbins), msg.get()).toBeTruthy();
    expect(noOverlap(mbins), msg.get()).toBeTruthy();
}


function noOverlap(mbins: Array<Bin>) : boolean {

    return mbins.every((bin: Bin) => {
        let placed = bin.placed;


        for(let i = 0; i < placed.length - 1; ++i) {
            for(let j = i+1; j < placed.length; ++j) {
                if(isOverlap(placed[i], placed[j])) {
                    return false;
                }
            }
        }

        return true;
    });
}

function inBounds(mbins : Array<Bin>) : boolean  {
    return mbins.every((bin : Bin) => {
        return bin.placed.every((prect : PlacedRect) => {
            if (prect.x0 < 0 || prect.y0 < 0 || prect.y0 + prect.h > bin.h || prect.x0 + prect.w > bin.w) {
                msg.edit("The rect id " + prect.id + "is out of bounds on wall")
                return false;
            }

            return true;
        });
    })
}

function areUnique(mbins : Array<Bin>) : boolean {
    let i = 0;

    let idSet = new Set();

    return mbins.every((bin : Bin) => {
            return bin.placed.every((prect : PlacedRect) => {

                if(idSet.has(prect.id)) {
                    msg.edit("The rect id "+ prect.id + "was found twice");
                    return false;
                } 
                
                return true;
            })
        }
    );
}

export function constructBins(bins : number[][], blockDims: number[][][], placedRectDims : number[][][] = null) : Array<Bin> {
    let mbins : Array<Bin> = []; 
    let placedRects = placedRectDims != null ? constructPlacedRects(placedRectDims) : [];

    bins.forEach((dims : Array<number>, i : number) => {
        //initialize freeblocks
        let freeSpaceList = new EdgeList();
        
        if(i < blockDims.length) {
            blockDims[i].forEach((dims : number[], blockNum : number) => {
               freeSpaceList.push(new FreeSpace({x0: dims[0], y0: dims[1], w: dims[2], h: dims[3]}));
            });
        }


        let finBin : Bin = new Bin({w: dims[0], h: dims[1], freeSpaces: freeSpaceList}); 

        if(i < placedRects.length) {
            placedRects[i].forEach((rect) => { finBin.place(rect); }, this);
        }

        mbins.push(finBin);
    });

    return mbins;
}

export function constructPlacedRects(rects : number[][][]) : PlacedRect[][] {
    let mrects : PlacedRect[][] = [];

    rects.forEach((rectDimArray, i) => {

        let binRects : PlacedRect[] = [];

        rectDimArray.forEach((dims : Array<number>, i : number) => {
            binRects.push(new PlacedRect({id: null, x0: dims[0], y0: dims[1], w: dims[2], h: dims[3]}));
        });

        mrects.push(binRects);

    });

    return mrects;
}

export function constructRects(rects : Array<Array<number>>) : Array<Rect> {
    let mrects : Array<Rect> = [];

    rects.forEach((dims : Array<number>, i : number) => {
        mrects.push({id: i, w: dims[0], h: dims[1], placed: false})
    });

    return mrects;
}
