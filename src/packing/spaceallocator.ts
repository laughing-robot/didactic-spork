import { retrieveOverlap, isOverlap, OverlapResponse } from "~packing/packing_utils";
import { Bin, Rect, PlacedRect, FreeSpace } from "~packing/bin";
import { Direction, getOppositeUpper, getOppositeLower } from "~packing/directions";

export interface Proposal {
    rect : PlacedRect;
    spaces : Set<FreeSpace>;
}

/*
 * Class the provides an anytime search for allocating sufficient space for an image given a bin
 * Provides multiple proposals for a given bin and a 
 *
 */
export class SpaceAllocator {

    rect : Rect;
    bin : Bin;
    frontier : Set<number>;
    exploredSpaces : Set<number>;
    cur_proposals : Array<Proposal>;
    final_proposals : Array<Proposal>;


    constructor({bin, rect}) {
        this.rect  = rect;
        this.bin = bin;
        this.frontier = new Set();
        this.exploredSpaces = new Set(); 
        this.cur_proposals = []; //collection of free spaces and a max rect 
        this.final_proposals = []; //TODO: sorted array of previously discovered => need to verify that those freeSpaces are unchanged 

    }

    setRect(rect : Rect) {
        this.rect = rect;
    }

    setBin(bin : Bin) {
        this.bin = bin;
    }


    getSpace() : Proposal {

        for(const [ id, space ] of Object.entries(this.bin.freeSpaces.freeSpaces)) {
            this.frontier.add(space.id); //prep
            this.findSpaces(new PlacedRect({}).fromFreeSpace(space));
            this.frontier.clear(); //clear array
        }

        let proposal : Proposal = this.cur_proposals.length > 0 ? this.cur_proposals.pop() : null;

        this.exploredSpaces.clear();
        this.cur_proposals.length = 0; //reset proposals 

        return proposal;
    }

    //TODO: find a way to propose + "clean"
    propose(rect : PlacedRect, spaces : Set<number>) {

        let freespaceSet : Set<FreeSpace> = new Set();
        let prop : Proposal = {rect: rect, spaces: freespaceSet};

        if(this.rect.w <= prop.rect.w && this.rect.h <= prop.rect.h) {
            Array.from(spaces).forEach((id, i) => {
                freespaceSet.add(this.bin.freeSpaces.get(id));
            });

            this.cur_proposals.push(prop);
        }
    };

    // does a brute force, anytime search for sufficient space on a bin
    //TODO: write this function to grow intelligently (i.e. need more width then check left and right neighbors, if none then give up)
    //TODO: there is an issue when we have 4 blocks at right angles + => potential solution is to maintain 2 maxRects and combine if possible
    findSpaces(maxRect : PlacedRect) : PlacedRect {

        // console.log(" MAX RECT " + maxRect.toString());
        // console.log(" SPACES " + this.frontier);

        let undo : Array<FreeSpace> = []; //stores details on how to undo the current iteration's loop

        if (this.rect.w <= maxRect.w && this.rect.h <= maxRect.h) {
            this.propose(maxRect, new Set(this.frontier)); //store a plausible solution
        }

        // iterate over right possibilities
        for(let key in this.frontier) {
            let curSpace : FreeSpace = this.frontier[key];

            //iterate over all neighbors
            //TODO: inefficient memory allocation for the combine => getNeighbors sucks
            for (const spaceId of curSpace.getNeighbors()) {

                let space : FreeSpace = this.bin.freeSpaces.get(spaceId);

                if(!this.exploredSpaces.has(space.id)) {
                    let newMaxRect : PlacedRect = this.computeAndCheckAdjacent(maxRect, space);

                    if(newMaxRect != null) {
                        this.markAndRemember(space, undo); // only remember if successfully forms a rectangle as an explored space

                        this.frontier.add(spaceId); 
                        this.findSpaces(newMaxRect);    
                        this.frontier.delete(spaceId); 

                    }
                }

            }
        }

        this.undo(undo);
        return;
    }

    //check if the block is adjacent to the current max rect, reform the max rectangle
    computeAndCheckAdjacent(maxRect : PlacedRect, space : FreeSpace) : PlacedRect {

        const { overlap, direction } : OverlapResponse = retrieveOverlap(maxRect, space);
        
        if(overlap == null) {
            return null;
        }

        return this.createNewMaxRect(maxRect, space, direction); 
    }

    // required to try this if x overlap
    // find all limiters for growth in the direction
    // if there are right & left limiters (need corresponding right and left adjacents)
    // NEED TO ALSO CHECK THE FRONTIER FOR LEFT AND RIGHT => CONSTRUCT MINIMUM FRONTIER (find min x0 and xe) => determine if a shrink is legal
    // if there are no limiters and we are adding a new block => may result in a shrink => need to check that shrink is legal => if no shrink (all good)
    // [other idea: maintain a minimum rectangle? see if minimum rectangle is violated]
    // update the minimum rectangle y0 to the new ye of the block
    // TODO: ABSTRACT AWAY THE DIRECTION
    createNewMaxRect(maxRect : PlacedRect, newSpace : FreeSpace, dir : Direction) {

        let newMaxRect : PlacedRect = new PlacedRect({}).fromPlacedRect(maxRect);
        let maxLim : number = Number.POSITIVE_INFINITY;
        let possible : boolean = true;

        let upDir : Direction = getOppositeUpper(dir);
        let lowDir : Direction = getOppositeLower(dir);

        let hasUpAdjacent : boolean = Array.from(newSpace.adj[upDir]).some((id) => {return this.frontier.has(id)});  // r,l => a,b && a,b => r,l
        let hasLowAdjacent : boolean = Array.from(newSpace.adj[lowDir]).some((id) => {return this.frontier.has(id)});

        let upLimiter : boolean = false;
        let lowLimiter : boolean = false;

        let newFrontier : Array<number> = Array.from(this.frontier);
        newFrontier.push(newSpace.id);

        newFrontier.forEach((spaceId, i) => { 
            let space : FreeSpace = this.bin.freeSpaces.get(spaceId);

            if(space.getLim(dir) < maxRect.getLim(dir)) {   // future limiting factors as we grow the rectangle => (a => ye, b => y0, r => xe, l => x0)

                if(space.getLim(upDir) <= newSpace.getLim(lowDir)) { 
                    upLimiter = true; 
                }
                else if(space.getLim(lowDir) >= newSpace.getLim(upDir)) {
                    lowLimiter = true;
                }
                
                maxLim = Math.max(maxLim, space.getLim(dir));
            }
            else if (space.getLim(dir) == maxRect.getLim(dir) && space.adj[dir].has(newSpace.id)) { //make sure we can grow into newSpace from previous hard limiter 
                possible = false;
            }

        }, this);

        if(!possible || !hasUpAdjacent && upLimiter || !hasLowAdjacent && lowLimiter) { 
            return null; //cannot place the newspace
        }

        newMaxRect.setLim(dir,  maxLim); //grow to max possible limit

        if(!upLimiter && !lowLimiter) { // shrink possible
            console.log(" SHRINK CASE ")
            newMaxRect.setLim(lowDir, newSpace.getLim(lowDir));
            newMaxRect.setLim(upDir, newSpace.getLim(upDir));

            //check if the new MaxRect contains the other rects or at least overlaps
            if(!Array.from(this.frontier).every((space) => {
                return isOverlap(newMaxRect, this.bin.freeSpaces.get(space));
            })) {
                return null;
            }
        }
        
        return newMaxRect;
    }


    markAndRemember(space: FreeSpace, undo : Array<FreeSpace>) : void {

        //already consumed
        undo.push(space);
        this.exploredSpaces.add(space.id);
    }

    //remove all spaces from exploredSpaces
    undo(undo : Array<FreeSpace>) {
        undo.forEach((space, i) => {
            this.exploredSpaces.delete(space.id);
        });
    }

}
