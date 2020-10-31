import { Heuristic } from "~packing/heuristics/utils";
import { Bin, PlacedRect } from "~packing/bin";
import { EuclideanDistance, Point, polarAngle } from "~utils";
 
/**
 * function to compute centeredness of images
 *
*/
export class CenterOfMassHeuristic implements Heuristic {
    k : number;
    bin_diag : number;
    bin : Bin;

    constructor(k = 0.5) {
        this.k = k;
    }

    init(bin: Bin): void {
        this.bin = bin;
        this.bin_diag = Math.pow(Math.pow(this.bin.w, 2) + Math.pow(this.bin.h, 2), 0.5);
    }


    evaluate()  {
        return 1 - EuclideanDistance(new Point(this.bin.w/2, this.bin.h/2), this.computeCenterOfMass(this.bin.placed).point) / (this.bin_diag / 2);
    }

    update() {
        return;
    }

    assessBlock(block : PlacedRect) {
        console.log(block.getString());
        return 1 - EuclideanDistance(new Point(this.bin.w/2, this.bin.h/2), this.computeCenterOfMass(this.bin.placed, block).point) / (this.bin_diag / 2);
    }

    assessBlock_depreciated(block : PlacedRect) {
        let {point, tmass} = this.computeCenterOfMass(this.bin.placed);
        let centerPoint = new Point(this.bin.w/2, this.bin.h/2);
        let obscure = Number(centerPoint.equals(point));

        //rotate about origin to determine the slope
        let targetAngle = polarAngle(centerPoint, point);
        let total = 0;
        let abs_total = 0;
 
        for(let i = block.x0; i < block.xe;) {
           let i_end = Math.min(block.xe, i + this.k); 

            for(let j = block.y0; j < block.ye;) {
                let j_end = Math.min(block.ye, j + this.k); 
                let block_center = new Point((i + i_end)/2,(j + j_end)/2);
                let delAngle : number;
                let block_angle : number = 0;

                if(block_center.equals(point) || obscure) {
                    delAngle = 1;
                }
                else {
                    block_angle = polarAngle(block_center, point);
                    delAngle = Math.max(0, Math.cos(block_angle - targetAngle));
                }

                let block_area = (i_end - i) * (j_end - j);
                let dist = Math.min(1, EuclideanDistance(block_center, point) / this.bin_diag * 2) * block_area; 


                total += dist * delAngle;  
                abs_total += block_area;

                j = j_end;
            }

            i = i_end;
        }

        return total / abs_total; 
    }

    computeCenterOfMass(rects : PlacedRect[], arect : PlacedRect = null) {

        if(rects.length == 0 && arect == null) return { point : new Point(this.bin.w/2, this.bin.h/2), tmass : 0};

        let xc = 0;
        let yc = 0;
        let tarea = 0;

        rects.forEach(rect => {
            let area = rect.w * rect.h;
            xc +=  (rect.xe + rect.x0) / 2.0 * (area);
            yc +=  (rect.ye + rect.y0) / 2.0 * (area);
            
            tarea += area;
        });

        if(arect != null) {
            let area = arect.w * arect.h;
            xc +=  (arect.xe + arect.x0) / 2.0 * (area);
            yc +=  (arect.ye + arect.y0) / 2.0 * (area);
            
            tarea += area;
        }

        return { point : new Point(xc / tarea, yc / tarea), tmass: tarea};
    } 

}
