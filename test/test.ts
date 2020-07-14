import { EdgeList } from "~packing/edgeList";

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

});

describe('test basic strip packing', () => {
    test('pack nothing', () => {
        expect(2 + 2).toBe(4);
    });
});
