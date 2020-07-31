import { EdgeList } from "~packing/edgeList"
import { FreeSpace, PlacedRect, Rect, Bin, FreeSpaceDict } from "~packing/bin"
import { SpaceAllocator, Proposal } from "~packing/spaceallocator"
import PriorityQueue from 'js-priority-queue';

export function packIt(rectangles : Array<Rect>, bins : Array<Bin>) {

    let i, j;

    let allocator = new SpaceAllocator({bin : null, rect : null});

    bins.sort(function(a : Bin, b : Bin) {return b.placed.length - a.placed.length});
                          
    let rects = new PriorityQueue({comparator: function(a,b) {return b.w - a.w},
                                    initialValues: rectangles});

    while (rects.length > 0) {
        let rect : Rect = rects.dequeue();

        for (let i = 0; i < bins.length; ++i) {

            let bin : Bin = bins[i];

            if (place(bin, rect, allocator)) {
                adjustBin(bins, i);
                rect.placed = true;
                break;
            }

        }
    }
}

function place(bin : Bin, rect : Rect, allocator : SpaceAllocator) : boolean {
    let x = 0, y = 0;

    allocator.setRect(rect);
    allocator.setBin(bin);

    //construct a profile of the free space
    let result : Proposal = allocator.getSpace();

    if(result == null || result.rect == null) {
        return false;
    }

    let placedPhoto : PlacedRect = new PlacedRect({}).fromRect(rect); 

    //initializes x0, y0 of placedPhoto based on heuristics
    selectPlacementLocation(placedPhoto, result.rect);

    for (const space of result.spaces) {

        //push the component on to be used
        bin.placed.push(placedPhoto);

        let spaces = computeResultantFreeSpaces(placedPhoto, space);

        // add the new spaces to bin.freeSpaces, updates adjacencies
        // TODO: make linking more efficient (move place into edgelist)
        bin.freeSpaces.pushList(spaces);

        // clean delete the id
        bin.freeSpaces.remove(space.id);
    }

    return true;
}


function addSpaces(freeSpaces, freeSpaceCandidates) {

    Object.values(freeSpaceCandidates).forEach(function(freeSpace, index) {
        if (freeSpace != null) {
            freeSpaces.push(freeSpace);
        }
    });

}


function selectPlacementLocation(placedPhoto : PlacedRect, maxRect : PlacedRect) {
    //simply choose bottom left
    placedPhoto.setX(maxRect.x0);
    placedPhoto.setY(maxRect.y0);

    return placedPhoto;
}


// produces resultant rectangles from a placement
function computeResultantFreeSpaces(placedPhoto : PlacedRect, freeSpace : FreeSpace) {

    //compute actual part of thej rect in the freeSpace
    //crop to the freeSpace
    let placedRect : PlacedRect = cropTo(placedPhoto, freeSpace);
    
    //assume that the coordinates '(0,0)' starts bottom left

    //right square
    let freeSpaceR = new FreeSpace({x0: placedRect.xe, y0: placedRect.y0, w: freeSpace.x0 + freeSpace.w - (placedRect.xe), h:placedRect.h});

    //above square
    let freeSpaceA = new FreeSpace({x0: placedRect.x0, y0: placedRect.ye, w:placedRect.w, h: freeSpace.y0 + freeSpace.h - (placedRect.ye)});

    //left square
    let freeSpaceL = new FreeSpace({x0: freeSpace.x0, y0: placedRect.y0, w: placedRect.x0 - freeSpace.x0, h: placedRect.h});

    //below square
    let freeSpaceB = new FreeSpace({x0: placedRect.x0, y0: freeSpace.y0, w:placedRect.w, h: placedRect.y0 - freeSpace.y0});

    //left, above square
    let freeSpaceLA = new FreeSpace({x0: freeSpaceL.x0, y0: freeSpaceA.y0, w: freeSpaceL.w, h: freeSpaceA.h});

    //left, below square
    let freeSpaceLB = new FreeSpace({x0: freeSpaceL.x0, y0: freeSpaceB.y0, w: freeSpaceL.w, h: freeSpaceB.h});

    //right, below square
    let freeSpaceRB = new FreeSpace({x0: freeSpaceR.x0, y0: freeSpaceB.y0, w: freeSpaceR.w, h: freeSpaceB.h});

    //right, above square
    let freeSpaceRA = new FreeSpace({x0: freeSpaceR.x0, y0: freeSpaceA.y0, w: freeSpaceR.w, h: freeSpaceA.h});

    let newSpaces = {r: freeSpaceR, ra: freeSpaceRA, a: freeSpaceA, la: freeSpaceLA, l: freeSpaceL, lb: freeSpaceLB, b: freeSpaceB, rb: freeSpaceRB };

    vet(newSpaces);

    return newSpaces;
};


//removes invalid spaces in place
function vet(spaces) {
    let i = 0;

    for (var key in spaces) {
        if(spaces[key].w <= 0 || spaces[key].h <= 0) {
            spaces[key] = null; //set to null 
        }
    }

    return spaces;
};

function cropTo(placedRect : PlacedRect, freeSpace : FreeSpace) : PlacedRect {
    let newRect : PlacedRect = new PlacedRect({}).fromRect(placedRect);

    newRect.setX(freeSpace.x0 * Number(placedRect.x0 < freeSpace.x0) + placedRect.x0 * Number(placedRect.x0 >= freeSpace.x0));
    newRect.setY(freeSpace.y0 * Number(placedRect.y0 < freeSpace.y0) + placedRect.y0 * Number(placedRect.y0 > freeSpace.y0));
    newRect.setW(Math.min(placedRect.w - (newRect.x0 - placedRect.x0), freeSpace.xe - newRect.x0));   
    newRect.setH(Math.min(placedRect.h - (newRect.y0 - placedRect.y0), freeSpace.ye - newRect.y0));   

    return newRect;
}


function adjustBin(bins : Array<Bin>, binNum : number) : void {
    let i = binNum + 1;

    //surf the equals
    while(i < bins.length && bins[i].placed.length == bins[binNum].placed.length - 1) {
        i = i + 1;
    }

    if (i > bins.length) {
        return;
    }

    //swap i and binNum
    [bins[binNum], bins[i - 1]] = [bins[i - 1], bins[binNum]];

}

