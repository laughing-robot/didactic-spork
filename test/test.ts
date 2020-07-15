import { EdgeList } from "~packing/edgeList";
import { Rect, Bin, FreeSpace, constructBin } from "~packing/bin"
import { packIt } from "~packing/strippacker"

describe('test edge list', () => {

    /**
     * create empty edge list
     */
    test('initialize list', () => {
        let mlist = new EdgeList(200);
        expect(mlist.size()).toBe(0);
        expect(mlist.maxSize).toBe(200);
        expect(mlist.ids.length).toBe(200);
    });

    /**
     * Bin: 20 by 10 
     *
     */
    test('simple placements', () => {
        let mbin : Bin = constructBin(20, 10);

        //create some rectangles
        let rect1 : Rect = {id: 0, w: 3, h: 5, placed: false};
        let rect2 : Rect = {id:1, w: 4, h: 4, placed: false};
        let rect3 : Rect = {id: 2, w: 2, h:5, placed: false};

        packIt([rect1, rect2, rect3], [mbin]);

        console.log(mbin.placed);
        
    });

});

