import EdgeList from "~/packing/edgeList"

export interface Bin {
    w: number;
    h: number;
    freeSpaces: EdgeList;
}

export interface FreeSpace {
    id: number;
    x0: number;
    y0: number;
    w: number;
    h: number;
    a: Array<FreeSpace>; //adj: {l:[], r:[], a:[], b:[]}
    b: Array<FreeSpace>;
    l: Array<FreeSpace>;
    r: Array<FreeSpace>;
}

export interface FreeSpaceDict {
    [spaceId: number] : FreeSpace;
}
