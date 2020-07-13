import { EdgeList } from "~edgeList"

// take in a bunch of posts
// take in a bunch of surfaces or 'bins'
// return coordinates on the surfaces
// rectangles are sorted from thickest to thinest

export function hello() {
    console.log("hello");

}

export function packIt(rectangles, bins) {

    let i, j;

    let bins = new PriorityQueue({comparator: function(a,b) {return b.pics - a.pics},
                                   initialValues: bins});
    let rects = new PriorityQueue({comparator: function(a,b) {return b.width - a.width},
                                    initalValues: rectangles});


    let assessed = [];

    while (rects.length > 0) {
        rect = rects.dequeue();

        while (bins.length > 0) {
            bin = bins.dequeue();

            assessed.push(bin);

            if (place(bin, rect)) {
                bins.insertAll(assessed);
                assessed.clear();
                break;
            }

        }

    }


}


function place(bin, rect, rnum) {
    let x = 0, y = 0;

    //construct a profile of the free space
    bin.freeSpaces.forEach(function (freeSpace, index) {
        if (freeSpace.w >= rect.w && freeSpace.h >= rect.h) {

            //push the component on to be used on return
            bins.components.push({rect: rnum, x: freeSpace.x0, y:freeSpace.y0});

            x = freeSpace.x0; y = freeSpace.y0;

            // (generated) break up free space
            // contains some null spaces
            spaces = placeInFreeSpace(rect, freeSpace, {x: x, y: y});

            // update edge list and adjacencies
            bin.freeSpaces.updateAdjacency([freeSpace.adj.l], [spaces.l, spaces.la, spaces.lb]);
            bin.freeSpaces.updateAdjacency([freeSpace.adj.r], [spaces.r, spaces.ra, spaces.rb]);
            bin.freeSpaces.updateAdjacency([freeSpace.adj.b], [spaces.b, spaces.rb, spaces.lb]);
            bin.freeSpaces.updateAdjacency([freeSpace.adj.a], [spaces.a, spaces.ra, spaces.rb]);

            // append the new spaces to bin.freeSpaces (ignores nullspaces)
            addSpaces(bin.freeSpaces, spaces);
        }
    });
}


function addSpaces(freeSpaces, freeSpaceCandidates) {

    freeSpaceCandidates.forEach(function(freeSpace, index) {
        if (freeSpace != null) {
            freeSpaces.push(space);
        }
    });

}

//more complex with multiple free spaces => need to detail adjacency stuff
function placeInFreeSpace(rect, freeSpace, coords) {

    //assume that the coordinates '(0,0)' starts bottom left

    //right square
    freeSpaceR = {x0: coords.x + rect.w, y0: coords.y, w: freeSpace.x0 + freeSpace.w - (coords.x + rect.w), h: rect.h };

    //above square
    freeSpaceA = {x0: coords.x, y0: coords.y + rect.h, w: rect.w, h: freeSpace.y0 + freeSpace.h - (coords.y + rect.h) };

    //left square
    freeSpaceL = {x0: freeSpace.x0, y0: coords.y, w; coords.x - freeSpace.x0, h: rect.h};

    //below square
    freeSpaceB = {x0: coords.x, y0: freeSpace.y0, w; rect.w, h: coords.y - freeSpace.y0};

    //left, above square
    freeSpaceLA = {x0: freeSpaceL.x0, y0: freeSpaceA.y0, w: freeSpaceL.w, h: freeSpaceA.h}

    //left, below square
    freeSpaceLB = {x0: freeSpaceL.x0, y0: freeSpaceB.y0, w: freeSpaceL.w, h: freeSpaceB.h}

    //right, below square
    freeSpaceRB = {x0: freeSpaceR.x0, y0: freeSpaceB.y0, w: freeSpaceR.w, h: freeSpaceB.h}

    //right, above square
    freeSpaceRA = {x0: freeSpaceR.x0, y0: freeSpaceA.y0, w: freeSpaceR.w, h: freeSpaceA.h}

    newSpaces = {r: freeSpaceR, ra: freeSpaceRA, a: freeSpaceA, rl: freeSpaceRL, l: freeSpaceL, b: freeSpaceB, la: freeSpaceLA, lb: freeSpaceLB, rb: freeSpaceRB, ra: freeSpaceRA};

    vet(newSpaces);

    return newSpaces;
};


//checks all spaces in spacesB against each space in spacesA
//updates the adjacency list accordingly
//edge list uses ids (hashmap)
function updateAdjacency(spacesA, spacesB) {

    spacesA.forEach(function (spaceA, i) {
        spacesB.forEach(function (spaceB, j) {

            //skip null spaces
            if (spaceB == null) {
                continue;
            }

            //above or below
            if ((spaceA.x0 <= spaceB.x0 && spaceA.x0 >= spaceB.x0 + spaceB.w) || (spaceB.x0 <= spaceA.x0 && spaceB.x0 >= spaceA.x0 + spaceA.w)) {
                if(spaceA.y0 + spaceA.h == spaceB.y0) {
                    //spaceA is below spaceB
                    spaceB.b.push(spaceA.id);
                    spaceA.a.push(spaceB.id);

                }
                else if(spaceB.y0 + spaceB.h == spaceA.y0) {
                    //spaceB is below spaceA
                    spaceB.a.push(spaceA.id);
                    spaceA.b.push(spaceB.id);
                }

            }
            else if ((spaceA.y0 <= spaceB.y0 && spaceA.y0 >= spaceB.y0 + spaceB.h) || (spaceB.y0 <= spaceA.y0 && spaceB.y0 >= spaceA.y0 + spaceA.h)) {
                if(spaceA.x0 + spaceA.w == spaceB.x0) {
                    //spaceA is left of spaceB
                    spaceB.l.push(spaceA.id);
                    spaceA.r.push(spaceB.id);

                }
                else if(spaceB.x0 + spaceB.w == spaceA.x0) {
                    //spaceA is left of spaceB
                    spaceB.r.push(spaceA.id);
                    spaceA.l.push(spaceB.id);
                }

            }

        });
    });
};


//removes invalid spaces in place
function vet(spaces) {
    let i = 0;

    for (var key in spaces)
        if(spaces[key].w <= 0 || spaces[key].h <= 0) {
            spaces[key] = null; //set to null and remove them
        }
    }

    return spaces;
};

// rectangles {
//  height: x,
//  width: y,
//  used: no,
// }

// bins {
// width: x,
// height: y;
// edgeList: {
// 0: [1, 2, 3],
// 1: [0]
// 2: [0,3]
// 3: [0,2]
// }
// components: [
//      {rect: 3, x: 0.2, y:0.2},
//  ]
// freeSpaces: [
//  {x0: 0, y0: 0, w: width, h: height}
//
// ],
// }
