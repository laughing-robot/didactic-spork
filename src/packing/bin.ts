import { EdgeList } from "~/packing/edgeList"

export interface Rect {
    id: number,
    w: number,
    h: number,
    placed: boolean 
}

export interface PlacedRect {
    rect: Rect,
    x0: number,
    y0: number
}

export interface Bin {
    freeSpaces: EdgeList;
    placed: Array<PlacedRect>;
}

export class FreeSpace {
    id: number;
    x0: number;
    y0: number;
    w: number;
    h: number;
    a: Array<number>; 
    b: Array<number>;
    l: Array<number>;
    r: Array<number>;

    constructor({id = null, x0, y0, w, h, a = [], b = [], l = [], r = []}) {
        this.id = id;
        this.x0 = x0;
        this.y0 = y0;
        this.w = w;
        this.h = h;

        //initializing lists
        this.a = a;
        this.b = b;
        this.l = l;
        this.r = r;
    }
}

export interface FreeSpaceDict {
    [spaceId: number] : FreeSpace;
}

export function constructBin(w : number, h: number) : Bin {

    let mbin : Bin = {freeSpaces: new EdgeList(), placed: []};

    let space : FreeSpace = new FreeSpace({
        id: null,
        x0: 0,
        y0: 0,
        w: w,
        h: h
    });

    mbin.freeSpaces.push(space);

    return mbin; 
}

