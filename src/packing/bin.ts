import { EdgeList } from "~packing/edgeList"
import { Direction } from "~packing/directions"
import { jsonify } from "~utils"
import { Heuristic } from "~packing/heuristics/utils"
import { CenterOfMassHeuristic } from "~packing/heuristics/centerofmass"
import { YSymmetryHeuristic, XSymmetryHeuristic } from "~packing/heuristics/symmetry"
import PriorityQueue from "js-priority-queue";

export interface Rect {
    id: number,
    w: number,
    h: number,
    placed: boolean 
}

export class PlacedRect implements Rect {

    id: number
    w: number
    h: number
    x0: number
    y0: number
    ye: number
    xe: number
    placed: boolean


    constructor({id = null, x0 = 0, y0 = 0, w = 0, h = 0, placed = false}) {
        this.x0 = x0;
        this.y0 = y0;
        this.w = w;
        this.h = h;
        this.id = id;
        this.placed = placed;

        this.update();
    }

    getString() {
        return jsonify({id: this.id, x0: this.x0, y0: this.y0, xe: this.xe, ye: this.ye, w: this.w, h: this.h}, 0);
    }

    fromRect(rect : Rect) : PlacedRect {
        this.w = rect.w;
        this.h = rect.h;
        this.placed = rect.placed;

        this.update();

        return this;
    }

    fromPlacedRect(placedRect : PlacedRect) : PlacedRect {
        this.w = placedRect.w;
        this.h = placedRect.h;
        this.x0 = placedRect.x0;
        this.y0 = placedRect.y0;

        this.update();

        return this;
    }

    shift({x: deltax, y: deltay}) : PlacedRect {
        this.x0 = this.x0 - deltax;
        this.y0 = this.y0 - deltay;
        this.update();

        return this;
    }

    fromFreeSpace(freeSpace : FreeSpace) : PlacedRect {

        this.w = freeSpace.w;
        this.h = freeSpace.h;
        this.x0 = freeSpace.x0;
        this.y0 = freeSpace.y0;

        this.update();

        return this;
    }

    setX(x : number) {
        this.x0 = x;

        this.update();
    }

    setY(y : number) {
        this.y0 = y;

        this.update();
    }

    setH(h : number) {
        this.h = h;

        this.update();
    }

    setW(w : number) {
        this.w = w;

        this.update();
    }


    update() : void {
        this.xe = this.x0 + this.w;
        this.ye = this.y0 + this.h;
    }

    getLim(dir : Direction) : number {
        switch(dir) {
            case Direction.Above:
                return this.ye;
            case Direction.Below:
                return this.y0;
            case Direction.Left:
                return this.x0;
            case Direction.Right:
                return this.xe;
        }


        throw "Invalid direction";
    }

    setLim(dir : Direction, val : number) {
        switch(dir) {
            case Direction.Above:
                this.ye = val;
                break;
            case Direction.Below:
                this.y0 = val;
                break;
            case Direction.Left:
                this.x0 = val;
                break;
            case Direction.Right:
                this.xe = val;
                break;
        }

        this.w = this.xe - this.x0;
        this.h = this.ye - this.y0;
    }
}

export class Bin {

    w: number;
    h: number;
    freeSpaces: EdgeList;
    placed: Array<PlacedRect>;
    heuristics : Array<Heuristic>;
    cached_proposals: Array<Object>;

    constructor({w, h, freeSpaces = new EdgeList(), placed = [], heuristics = [new XSymmetryHeuristic(), new YSymmetryHeuristic(), new CenterOfMassHeuristic()]}) {
        this.w = w;
        this.h = h;
        this.freeSpaces = freeSpaces;
        this.placed = [];
        this.heuristics = heuristics;
        this.cached_proposals = [];

        this.heuristics.forEach((heuristic : Heuristic) => {
            heuristic.init(this);
        });

        placed.forEach((rect) => {
            this.place(rect);
        }, this);

        if(this.freeSpaces.size() == 0) { //initialize the block
            this.freeSpaces.push(new FreeSpace({x0: 0, y0: 0, w: this.w, h: this.h}));
        }

    }

    getString() {
        return jsonify({w : this.w, h : this.h, freeSpaces : this.freeSpaces, placed : this.placed}, 0);
    }

    place(rect : PlacedRect) {
        this.placed.push(rect);
        this.heuristics.forEach(heuristic => {
            heuristic.update(rect);
        });
    }

    getHeuristics() : number[] {
        return this.heuristics.map(heuristic => {
            return heuristic.evaluate();
        });
    }

    getAssessment(block : PlacedRect) : number[] {
        return this.heuristics.map(heuristic => {
            return heuristic.assessBlock(block);
        });
    }

    acceptProposals(proposal_list) {
                
    }

    purgeProposals() {
        
    }

}

export class FreeSpace extends PlacedRect {
    id: number;
    x0: number;
    y0: number;
    xe: number;
    ye: number;
    w: number;
    h: number;
    a: Set<number>; 
    b: Set<number>;
    l: Set<number>;
    r: Set<number>;
    adj: Array<Set<number>>;

    constructor({id = null, x0, y0, w, h, a = [], b = [], l = [], r = []}) {
        super({id: id, x0: x0, y0: y0, w: w, h: h});

        //initializing lists
        this.a = new Set(a);
        this.b = new Set(b);
        this.l = new Set(l);
        this.r = new Set(r);
        this.adj = [this.a, this.b, this.r, this.l]; //must be kept consistent with directions
    }


    getNeighbors() : Set<number> {
        return new Set([...this.a, ...this.b, ...this.r, ...this.l]);
    }

    remove(id) : void {
        if(!this.adj.some((mset) => {
            return mset.delete(id);
        })) {
            throw "Unable to remove id";
        }
    }

}

export interface FreeSpaceDict {
    [spaceId: number] : FreeSpace;
}


