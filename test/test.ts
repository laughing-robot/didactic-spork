import { EdgeList } from "~packing/edgeList";
import { Rect, Bin, FreeSpace } from "~packing/bin"
import { packIt } from "~packing/strippacker"
import { verifyPacking } from "./pack_test_utils"
import axios from 'axios'

beforeAll(() => {
  axios.defaults.adapter = require('axios/lib/adapters/http');
});

afterAll(()=> {
    axios.post('http://localhost:8080', {'close': true});
});



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
    test('simple placements', async () => {
        let mbin : Bin = new Bin({w: 20, h: 10});

        //create some rectangles
        let rect1 : Rect = {id: 0, w: 3, h: 5, placed: false};
        let rect2 : Rect = {id:1, w: 4, h: 4, placed: false};
        let rect3 : Rect = {id: 2, w: 2, h:5, placed: false};

        packIt([rect1, rect2, rect3], [mbin]);

        //send to endpoint to be saved
        verifyPacking([mbin]);

        await recordResults([mbin], 'simple_placements')
        
    });

    test('complex placements', async () => {
        let rectDims = [ [3, 3], [5, 2], [6,6.75], [2,10], [3,3], [2.5, 4], [6, 13], [2.25, 2], [1.21, 3], [5.42, 3], [3, 4.23], [5, 4], [4, 11], [2, 6.23], [4, 4], [1.2, 1.2], [1.2, 1.2] ];
        let binDims = [[20, 10], [5, 10], [5, 10], [15, 10], [20, 10], [10, 10], [5, 10], [10, 5]];

        let rects : Array<Rect>  = constructRects(rectDims)
        let bins : Array<Bin> = constructBins(binDims)

        packIt(rects, bins);

        await recordResults(bins, 'complex_placements');

        verifyPacking(bins);
    });

});


function recordResults(binList : Array<Bin>, title : string = "nah" ) {

    let post_body = {"title": title}

    binList.forEach(function (bin, i) {

        //hacky way
        let tmp = bin.freeSpaces;
        bin.freeSpaces = null;

        post_body[i] = JSON.stringify(bin);

        bin.freeSpaces = tmp;
    });


    return axios.post('http://localhost:8080', post_body);
}


function constructBins(bins : Array<Array<number>>) : Array<Bin> {
    let mbins : Array<Bin> = [] 

    bins.forEach((dims : Array<number>, i : number) => {
        mbins.push(new Bin({w: dims[0], h: dims[1]}));

    });

    return mbins;
}

function constructRects(rects : Array<Array<number>>) : Array<Rect> {
    let mrects : Array<Rect> = [];

    rects.forEach((dims : Array<number>, i : number) => {
        mrects.push({id: i, w: dims[0], h: dims[1], placed: false})
    });

    return mrects;
}
