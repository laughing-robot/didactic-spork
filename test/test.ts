import { EdgeList } from "~packing/edgeList";
import { Rect, Bin, FreeSpace } from "~packing/bin"
import { packIt } from "~packing/strippacker"
import { verifyPacking } from "./pack_test_utils"
import { jsonify } from "~utils"
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
    test('simple packing', async () => {
        let mbin : Bin = new Bin({w: 20, h: 10});

        //create some rectangles
        let rect1 : Rect = {id: 0, w: 3, h: 5, placed: false};
        let rect2 : Rect = {id:1, w: 4, h: 4, placed: false};
        let rect3 : Rect = {id: 2, w: 2, h:5, placed: false};

        packIt([rect1, rect2, rect3], [mbin]);
       
        if(mbin.freeSpaces == null) {
            throw "freeSpaces not be null!";
        }

        //visualize
        await recordResults([mbin], 'simple_packing');

        //send to endpoint to be saved
        verifyPacking([mbin]);
    });

    test('distributed packing', async () => {
        let rectDims = [ [3, 3], [5, 2], [6,6.75], [2,10], [3,3], [2.5, 4], [6, 13], [2.25, 2], [1.21, 3], [5.42, 3], [3, 4.23], [5, 4], [4, 11], [2, 6.23], [4, 4], [1.2, 1.2], [1.2, 1.2] ];
        let binDims = [[20, 10], [5, 10], [5, 10], [15, 10], [20, 10], [10, 10], [5, 10], [10, 5]];

        let rects : Array<Rect>  = constructRects(rectDims)
        let bins : Array<Bin> = constructBins(binDims, [])


        packIt(rects, bins);

        //visualize
        await recordResults(bins, 'distributed_packing');

        verifyPacking(bins);
    });


    //TODO: this test is breaking!
    test('sorted tight packing', async() => {
        let mbin : Bin = new Bin({w: 10, h: 7});

        let rectDims = [ [5, 3], [5,3], [5,3], [5,2], [5,1], [5,1], [2.5, 1], [2.5, 1] ]; 

        let rects : Array<Rect>  = constructRects(rectDims)

        packIt(rects, [mbin]);

        //visualize
        await recordResults([mbin], 'tight_packing');

        verifyPacking([mbin]);

    });
});

describe('rigorous allocation test', () => {

    test('hanging garden', async() => {
        
        let binDims = [ [20, 10] ];
        let rectDims = [ [20, 10] ]; 

        let freeBlocks = [
            [ [0, 0, 5, 10], [5, 0, 10, 3], [5, 3, 10, 3], [5, 6, 10, 4], [15, 0, 5, 10] ]
        ]; 


        let rects : Array<Rect>  = constructRects(rectDims);
        let bins : Array<Bin> = constructBins(binDims, freeBlocks);

        packIt(rects, bins);

        //visualize
        await recordResults(bins, 'hanging_packing');

        verifyPacking(bins);
    });

    test('crossy road packing', async() => {
        
        let binDims = [ [20, 10] ];
        let rectDims = [ [20, 10] ]; 

        let freeBlocks = [
            [ [0, 0, 4, 4], [0, 4, 4, 6], [4, 0, 4, 6], [4, 6, 4, 4], [8, 0, 12, 5], [8, 5, 12, 5] ]
        ]; 


        let rects : Array<Rect>  = constructRects(rectDims);
        let bins : Array<Bin> = constructBins(binDims, freeBlocks);

        packIt(rects, bins);

        //visualize
        await recordResults(bins, 'crossy_packing');

        verifyPacking(bins);
    });

    test('flappy bird packing', async() => {
        
        let binDims = [ [10, 10] ];
        let rectDims = [ [10, 1] ]; 

        let freeBlocks = [
            [ [0, 4, 1, 1], [1, 0, 8, 10], [9, 4, 1, 1] ]
        ]; 


        let rects : Array<Rect>  = constructRects(rectDims);
        let bins : Array<Bin> = constructBins(binDims, freeBlocks);

        packIt(rects, bins);

        //visualize
        await recordResults(bins, 'flappy_packing')

        verifyPacking(bins);
    });

    test('nemo packing', async() => {
        
        let binDims = [ [10, 10] ];
        let rectDims = [ [10, 1] ]; 

        let freeBlocks = [
            [ [0, 3, 1, 3], [1, 0, 8, 10], [9, 4, 1, 1] ]
        ]; 


        let rects : Array<Rect>  = constructRects(rectDims);
        let bins : Array<Bin> = constructBins(binDims, freeBlocks);

        packIt(rects, bins);

        //visualize
        await recordResults(bins, 'nemo_packing')

        verifyPacking(bins);
    });

    test('tetris packing', async() => {
        
        let binDims = [ [10, 10] ];
        let rectDims = [ [10, 4] ]; 

        let freeBlocks = [
            [ [0, 0, 6, 10], [6, 3, 4, 4] ]
        ]; 


        let rects : Array<Rect>  = constructRects(rectDims);
        let bins : Array<Bin> = constructBins(binDims, freeBlocks);

        packIt(rects, bins);

        //visualize
        await recordResults(bins, 'tetris_packing')

        verifyPacking(bins);
    });

});

function recordResults(binList : Array<Bin>, title : string = "nah" ) {

    let post_body = {"title": title}

    binList.forEach(function (bin, i) {

        //hacky way
        // let tmp = bin.freeSpaces;
        // bin.freeSpaces = null;

        // store the bin itself
        post_body[i] = jsonify(bin, 0); //JSON.stringify(bin);


        //bin.freeSpaces = tmp;
    });

    console.log(post_body);

    return axios.post('http://localhost:8080', post_body);
}


function constructBins(bins : number[][], blockDims: number[][][]) : Array<Bin> {
    let mbins : Array<Bin> = []; 

    bins.forEach((dims : Array<number>, i : number) => {
        //initialize freeblocks
        let freeSpaceList = new EdgeList();
        
        if(i < blockDims.length) {
            blockDims[i].forEach((dims : number[], blockNum : number) => {
               freeSpaceList.push(new FreeSpace({x0: dims[0], y0: dims[1], w: dims[2], h: dims[3]}));
            });
        }

        mbins.push(new Bin({w: dims[0], h: dims[1], freeSpaces: freeSpaceList}));
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
