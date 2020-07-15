import { EdgeList } from "~packing/edgeList"
import { FreeSpace, PlacedRect, Rect, Bin } from "~packing/bin"
import PriorityQueue from 'js-priority-queue';

// take in a bunch of posts
// take in a bunch of surfaces or 'bins'
// return coordinates on the surfaces
// rectangles are sorted from thickest to thinest


export function packIt(rectangles : Array<Rect>, bins : Array<Bin>) {

    let i, j;

    bins.sort(function(a : Bin, b : Bin) {return b.placed.length - a.placed.length});
                          
    let rects = new PriorityQueue({comparator: function(a,b) {return b.w - a.w},
                                    initialValues: rectangles});


    while (rects.length > 0) {
        let rect : Rect = rects.dequeue();

        for (let i = 0; i < bins.length; ++i) {

            let bin : Bin = bins[i];

            if (place(bin, rect)) {
                //swap bin and next bin
                adjustBin(bins, i);
                rect.placed = true;
                break;
            }

        }
    }
}


function place(bin : Bin, rect : Rect) : boolean {
    let x = 0, y = 0;

    //construct a profile of the free space
    for (const [ id, freeSpace ] of Object.entries(bin.freeSpaces.get())) {
        if (freeSpace.w >= rect.w && freeSpace.h >= rect.h) {

            console.log("FOUND A MATCH");

            //push the component on to be used on return
            bin.placed.push({rect: rect, x0: freeSpace.x0, y0:freeSpace.y0});

            x = freeSpace.x0; y = freeSpace.y0;

            // (generated) break up free space
            // contains some null spaces
            let spaces = placeInFreeSpace(rect, freeSpace, {x: x, y: y});

            console.log(freeSpace);
            console.log(rect);
            console.log(spaces);

            // add the new spaces to bin.freeSpaces 
            addSpaces(bin.freeSpaces, spaces);

            // update edge list and adjacencies
            bin.freeSpaces.updateAdjacency(freeSpace.l, [spaces.l, spaces.la, spaces.lb]);
            bin.freeSpaces.updateAdjacency(freeSpace.r, [spaces.r, spaces.ra, spaces.rb]);
            bin.freeSpaces.updateAdjacency(freeSpace.b, [spaces.b, spaces.rb, spaces.lb]);
            bin.freeSpaces.updateAdjacency(freeSpace.a, [spaces.a, spaces.ra, spaces.rb]);

            bin.freeSpaces.remove(id);

            return true;
        }
    };

    return false;
}


function addSpaces(freeSpaces, freeSpaceCandidates) {

    Object.values(freeSpaceCandidates).forEach(function(freeSpace, index) {
        if (freeSpace != null) {
            freeSpaces.push(freeSpace);
        }
    });

}

//more complex with multiple free spaces => need to detail adjacency stuff
function placeInFreeSpace(rect, freeSpace, coords) {

    //assume that the coordinates '(0,0)' starts bottom left

    //right square
    let freeSpaceR = new FreeSpace({x0: coords.x + rect.w, y0: coords.y, w: freeSpace.x0 + freeSpace.w - (coords.x + rect.w), h: rect.h});

    //above square
    let freeSpaceA = new FreeSpace({x0: coords.x, y0: coords.y + rect.h, w: rect.w, h: freeSpace.y0 + freeSpace.h - (coords.y + rect.h)});

    //left square
    let freeSpaceL = new FreeSpace({x0: freeSpace.x0, y0: coords.y, w: coords.x - freeSpace.x0, h: rect.h});

    //below square
    let freeSpaceB = new FreeSpace({x0: coords.x, y0: freeSpace.y0, w: rect.w, h: coords.y - freeSpace.y0});

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


function adjustBin(bins : Array<Bin>, binNum : number) : void {
    let i = binNum + 1;

    //surf the equals
    while(i < bins.length && bins[i].placed.length == bins[binNum].placed.length - 1) {
        i = i + 1;
    }

    if (i >= bins.length) {
        return;
    }

    //swap i and binNum
    [bins[binNum], bins[i]] = [bins[i], bins[binNum]];
}

