import { Heuristic } from "~packing/heuristics/utils";
import { Bin, PlacedRect } from "~packing/bin";
import { EuclideanDistance, Point, rotate, LineSegment, polarAngle, contains, superImposed } from "~utils";

/**
 * function to compute centeredness of images
 *
*/
class CenterOfMass implements Heuristic {
    k : number;
    shift_delta: number;

    constructor(k = 5, shift_delta = 1e-5) {
        this.k = k;
    }

    assessBlock(bin : Bin, oblock : PlacedRect) {
        let {point, tmass} = this.computeCenterOfMass(bin.placed);
        let centerPoint = {x: bin.w/2, y: bin.h/2};
        let block = new PlacedRect({}).fromPlacedRect(oblock).shift(centerPoint);

        //rotate about origin to determine the slope
        let targetAngle = polarAngle(rotate(centerPoint, point, 180));
    }

    computeCenterOfMass(rects : PlacedRect[]) {
        let xc = 0;
        let yc = 0;
        let tarea = 1e-10;

        rects.forEach(rect => {
            let area = rect.w * rect.h;
            xc +=  (rect.xe - rect.x0) / 2.0 * (area);
            yc +=  (rect.ye - rect.y0) / 2.0 * (area);
            
            tarea += area;
        });

        return { point : {x: xc / tarea, y : yc / tarea}, tmass: tarea};
    } 

    evaluate(bin : Bin)  {
        return EuclideanDistance({x: 0, y: 0}, this.computeCenterOfMass(bin.placed).point);
    }
}

export function computeCenteredness(bin : Bin, placedRects : PlacedRect[]) {
    let Xmidline : number = bin.w / 2.0;
    let Ymidline : number = bin.h / 2.0;
    let Xmse : number = 0;
    let Ymse : number = 0;

    placedRects.forEach((rect, i) => {
        Xmse += (Xmidline - (rect.x0 + rect.w/2.0)) * (rect.w * rect.h);    
        Ymse += (Ymidline - (rect.y0 + rect.h/2.0)) * (rect.w * rect.h);    
    });

    return {xmse: Xmse, ymse: Ymse};
};

/**
* function to compute the center of mass
*/
export function computeCenterMass(bin : Bin, placedRects : PlacedRect[]) {

    placedRects.forEach((rect) => {
            
    });
}

