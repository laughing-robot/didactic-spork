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

        // compute theta of all four points ordered TODO: make this more efficient
        let points : Point[] = [{x: block.x0, y: block.y0}, {x: block.x0, y: block.ye}, 
                                {x: block.xe, y: block.y0}, {x: block.xe, y: block.ye} ];
        points = points.map((point) => { return {x: point.x - centerPoint.x, y: point.y - centerPoint.y}; });

        // avoid resting on an axis
        points.forEach(point => {
            if(point.x == 0) {
                point.x = 1e-3;
            }
            if(point.y == 0) {
                point.y = 1e-3;
            }

            return point;
        });

        points.sort((a, b) => { return polarAngle(a) - polarAngle(b)});

        let angles : number[] = points.map((point) => {return polarAngle(point)});

        if(contains(block, centerPoint)) {
            //different calculation
            let DA : LineSegment = new LineSegment(points[0], points[3]);
        }

        // create segments
        let AB : LineSegment = new LineSegment(points[0], points[1]);
        let AC : LineSegment = new LineSegment(points[0], points[2]);
        let BD : LineSegment = new LineSegment(points[1], points[3]);
        let CD : LineSegment = new LineSegment(points[2], points[3]);

        // create integral 
        this.getIntegral(AB, AC, targetAngle, angles[0], angles[1]);
        this.getIntegral(AC, BD, targetAngle, angles[1], angles[2]);
        this.getIntegral(BD, CD, targetAngle, angles[2], angles[3]);
    }

    getIntegral(seg1 : LineSegment, seg2 : LineSegment, targetAngle, angleStart, angleEnd) {
        if(seg1.isHorizontal() && seg2.isHorizontal()) {
            return this.HHIntegral(seg1, seg2, targetAngle, angleStart, angleEnd);
        }
        else if(seg1.isVertical() && seg2.isVertical()) {
            return this.VVIntegral(seg1, seg2, targetAngle, angleStart, angleEnd);
        }
        else {
            if(seg1.isVertical() && seg2.isHorizontal()) {
                return this.VHIntegral(seg1, seg2, targetAngle, angleStart, angleEnd);
            }
            else {
                return this.VHIntegral(seg2, seg1, targetAngle, angleStart, angleEnd);
            }
        }
    }

    VIntegral(seg, targetAngle, angleStart, angleEnd) {

    }

    HIntegral(seg, targetAngle, angleStart, angleEnd) {

    }

    VVIntegral(seg1, seg2, targetAngle, angleStart, angleEnd) {
                
    }

    HHIntegral(seg1, seg2, targetAngle, angleStart, angleEnd) {

    }

    VHIntegral(segV, segH, targetAngle, angleStart, angleEnd) {

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

