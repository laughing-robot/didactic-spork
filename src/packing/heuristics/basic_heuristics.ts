/**
 * function to compute centeredness of images
 *
*/
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

