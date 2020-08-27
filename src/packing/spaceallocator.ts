import { overlapDir, isOverlap, OverlapResponse } from "~packing/packing_utils";
import { Bin, Rect, PlacedRect, FreeSpace } from "~packing/bin";
import { Direction, getOppositeUpper, getOppositeLower, bound, fartherThan } from "~packing/directions";

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
    proposal_limit : number;


    constructor({bin, rect}) {
        this.rect  = rect;
        this.bin = bin;
        this.frontier = new Set();
        this.exploredSpaces = new Set(); 
        this.proposal_limit = 20;
        this.cur_proposals = []; //collection of free spaces and a max rect 
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

            //TODO: need to mark and remember here :)

            // console.log("SPACE: " + space.id)
            // console.log(space.getString())
            this.findSpaces(new PlacedRect({}).fromFreeSpace(space));
            this.frontier.clear(); //clear array
            this.exploredSpaces.add(space.id);
        }

        let proposal : Proposal = this.cur_proposals.length > 0 ? this.cur_proposals.pop() : null;

        this.exploredSpaces.clear();
        this.cur_proposals.length = 0; //reset everything 

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

        let undo : Array<FreeSpace> = []; //stores details on how to undo the current iteration's loop

        if(this.rect.w <= maxRect.w && this.rect.h <= maxRect.h) {
            this.propose(maxRect, new Set(this.frontier)); //store a plausible solution
        }

        // console.log("max rect")
        // console.log(maxRect.getString())

        // iterate over right possibilities
        for(let key of this.frontier) {
            let curSpace : FreeSpace = this.bin.freeSpaces.get(key);


            //iterate over all neighbors
            //TODO: inefficient memory allocation for the combine => getNeighbors sucks
            
            for (const spaceId of curSpace.getNeighbors()) {

                let space : FreeSpace = this.bin.freeSpaces.get(spaceId);

                // console.log("NEIGHBOR: " + space.id);
                // console.log(space.getString())

                if (this.exploredSpaces.has(space.id) || this.frontier.has(space.id)) { // already explored or already contains
                    continue;
                }

                let newMaxRect : PlacedRect = this.computeAndCheckAdjacent(maxRect, space);

                if(newMaxRect != null) {
                    // console.log("ADJACENT")
                    this.markAndRemember(space, undo); // only remember if successfully forms a rectangle as an explored space
                    this.frontier.add(spaceId); 

                    this.findSpaces(newMaxRect);    
                    this.frontier.delete(spaceId); 
                }
                else {
                    
                }
            }
        }

        this.undo(undo);
        return;
    };

    //check if the block is adjacent to the current max rect, reform the max rectangle
    computeAndCheckAdjacent(maxRect : PlacedRect, space : FreeSpace) : PlacedRect {

        let direction : Direction = overlapDir(maxRect, space);

        if(direction == Direction.None) {
            console.log("NOT ADJACENT");
            return null;
        }

        return this.createNewMaxRect(maxRect, space, direction); 
    }

    // TODO: ABSTRACT AWAY THE DIRECTION
    createNewMaxRect(maxRect : PlacedRect, newSpace : FreeSpace, dir : Direction) {

        let newMaxRect : PlacedRect = new PlacedRect({}).fromPlacedRect(maxRect);
        let maxLim : number;
        let isNotHardLimited : boolean = true;

        let upDir : Direction = getOppositeUpper(dir);
        let lowDir : Direction = getOppositeLower(dir);

        let hasUpAdjacent : boolean = Array.from(newSpace.adj[upDir]).some((id) => {return this.frontier.has(id)});
        let hasLowAdjacent : boolean = Array.from(newSpace.adj[lowDir]).some((id) => {return this.frontier.has(id)});

        let upLimiter : boolean = false;
        let lowLimiter : boolean = false;

        let newFrontier : Array<number> = Array.from(this.frontier);
        newFrontier.push(newSpace.id);

        isNotHardLimited = newFrontier.every((spaceId) => { 
            let space : FreeSpace = this.bin.freeSpaces.get(spaceId);

            if(fartherThan(dir, space.getLim(dir), maxRect.getLim(dir))) {   // future limiting factors as we grow the rectangle 

                if(space.getLim(upDir) <= newSpace.getLim(lowDir)) { 
                    lowLimiter = true; 
                }
                else if(space.getLim(lowDir) >= newSpace.getLim(upDir)) {
                    upLimiter = true;
                }
                
                maxLim = bound(dir, maxLim, space.getLim(dir)); 
            }
            else if (space.getLim(dir) == maxRect.getLim(dir) && overlapDir(space, newSpace) != dir) { //make sure we can grow into newSpace from previous hard limiter 
                return false;
            }

            return true;

        }, this);

        if(!isNotHardLimited || !hasUpAdjacent && upLimiter || !hasLowAdjacent && lowLimiter) { 
            // console.log("Failed: " + !isNotHardLimited + hasUpAdjacent + upLimiter + hasLowAdjacent + lowLimiter)
            return null; //cannot place the newspace
        }

        // console.log("MAX LIM: " + maxLim);

        newMaxRect.setLim(dir, maxLim); //grow to max possible limit

        //TODO: doesn't work because the capping rectangle needs to be bound => DOES THIS WORK?????
        if (!upLimiter && !lowLimiter) { // shrink possible
            // console.log(" SHRINK CASE ");
            newMaxRect.setLim(lowDir, Math.max(newSpace.getLim(lowDir), maxRect.getLim(lowDir)));
            newMaxRect.setLim(upDir, Math.min(newSpace.getLim(upDir), maxRect.getLim(upDir)));

            //check if the new MaxRect contains the other rects or at least overlaps
            if(!Array.from(this.frontier).every((space) => {
                return isOverlap(newMaxRect, this.bin.freeSpaces.get(space));
            })) {
                return null;
            }
        }

        // console.log("NEW RECT")
        // console.log(newMaxRect.getString())

        
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
