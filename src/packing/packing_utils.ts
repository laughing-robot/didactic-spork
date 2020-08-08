import { FreeSpace, PlacedRect, Rect } from "~packing/bin";
import { Direction } from "~packing/directions";

export interface OverlapResponse {
    overlap: Array<Array<number>>;
    direction: Direction;
}

export function overlapDir(rect1: PlacedRect, rect2 : PlacedRect) : Direction {
    return retrieveOverlap(rect1, rect2).direction;
}

//checks if two rectangles are adjacent and returns the line segment of the intersection (x1, y1) <-> (x2, y2)
export function retrieveOverlap(rect1 : PlacedRect, rect2 : PlacedRect) : OverlapResponse {

    let overlap : Array<Array<number>> = null;
    let dir : Direction = Direction.None;

    if( !(rect1.x0 >= rect2.xe || rect2.x0 >= rect1.xe) ) { // overlap along x
        if(rect1.y0 == rect2.ye) { // glued bottom to top
            overlap = [[Math.max(rect1.x0, rect2.x0), rect1.y0], [Math.min(rect1.xe, rect2.xe), rect1.y0]];
            dir = Direction.Below;
        }
        else if(rect1.ye == rect2.y0) { //glued top to bottom
            overlap = [[Math.max(rect1.x0, rect2.x0), rect1.ye], [Math.min(rect1.xe, rect2.xe), rect1.ye]];
            dir =  Direction.Above;
        }
    }
    else if( !(rect1.y0 >= rect2.ye || rect2.y0 >= rect1.ye) ) { //overlap along y
        if(rect1.x0 == rect2.xe) { //glued left to right
            overlap = [[rect1.x0, Math.max(rect1.y0, rect2.y0)], [rect1.x0, Math.min(rect1.ye, rect2.ye)]];
            console.log("LEFT");
            dir = Direction.Left;
        }
        else if(rect1.xe == rect2.x0) { //glued right to left 
            overlap = [[rect1.xe, Math.max(rect1.y0, rect2.y0)], [rect1.xe, Math.min(rect1.ye, rect2.ye)]];
            dir = Direction.Right;
        }
    }

    return { overlap: overlap, direction: dir };
}

export function isOverlap(prect1 : PlacedRect, prect2 : PlacedRect) : boolean {

    if ( prect1.x0 >= prect2.xe || prect1.xe <= prect2.x0) { //to the left
        return false;
    }
    else if( prect1.y0 >= prect2.ye || prect1.ye <= prect2.y0 ) { //to the top
        return false;
    }

    return true;
}
