import { Rect, Bin, PlacedRect } from "~packing/bin"
import { isOverlap } from "~packing/packing_utils"
import  msg from "./msg"

export function verifyPacking(mbins) {
    // verify uniqueness of ids
    expect(areUnique(mbins), msg.get()).toBeTruthy();
    expect(inBounds(mbins), msg.get()).toBeTruthy();
    expect(noOverlap(mbins), msg.get()).toBeTruthy();
}


function noOverlap(mbins: Array<Bin>) : boolean {

    return mbins.every((bin: Bin) => {
        let placed = bin.placed;


        for(let i = 0; i < placed.length - 1; ++i) {
            for(let j = i+1; j < placed.length; ++j) {
                if(isOverlap(placed[i], placed[j])) {
                    return false;
                }
            }
        }

        return true;
    });
}

function inBounds(mbins : Array<Bin>) : boolean  {
    return mbins.every((bin : Bin) => {
        return bin.placed.every((prect : PlacedRect) => {
            if (prect.x0 < 0 || prect.y0 < 0 || prect.y0 + prect.h > bin.h || prect.x0 + prect.w > bin.w) {
                msg.edit("The rect id " + prect.id + "is out of bounds on wall")
                return false;
            }

            return true;
        });
    })
}

function areUnique(mbins : Array<Bin>) : boolean {
    let i = 0;

    let idSet = new Set();

    return mbins.every((bin : Bin) => {
            return bin.placed.every((prect : PlacedRect) => {

                if(idSet.has(prect.id)) {
                    msg.edit("The rect id "+ prect.id + "was found twice");
                    return false;
                } 
                
                return true;
            })
        }
    );
}
