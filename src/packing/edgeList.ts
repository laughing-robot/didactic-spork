import { Bin, FreeSpace, FreeSpaceDict } from "~packing/bin"

export class EdgeList {

    //variables
    ids : Array<number>;
    maxSize : number;
    freeSpaces : FreeSpaceDict;


    constructor(maxSize : number = 500) {
         this.ids = [...Array(maxSize).keys()];
         this.maxSize = maxSize;
         this.freeSpaces = {};
    };

    pushList(spaces) : void {
        Object.keys(spaces).map((key, index) => {
            this.push(spaces[key]);
        }, this);
    }

    push(space) : void {

        if(space == null) {
            return;
        }

        if (this.size() > this.maxSize) {
            throw "Fatal error exceeded maxSize";
        }

        space.id = this.ids.pop();
        this.freeSpaces[space.id] = space;
        this.linkSpace(space);
    }

    remove(id) : void {
        this.freeSpaces[id].remove(id);
        delete this.freeSpaces[id];
        this.ids.push(id);
    }

    size() : number {
        return Object.keys(this.freeSpaces).length;
    }

    get(num) : FreeSpace {
        return this.freeSpaces[num];
    }

    linkSpace(newSpace) : void {
        for(const [ id, space ] of Object.entries(this.freeSpaces)) {
            this.updateAdjacencyBySpace(space, newSpace);
        } 
    }

    updateAdjacencyById(id1 : number, id2 : number) : void {
        this.updateAdjacencyBySpace(this.freeSpaces[id1], this.freeSpaces[id2]);
    }

    updateAdjacencyBySpace(spaceA : FreeSpace, spaceB : FreeSpace) {
                
        if(spaceA.id == spaceB.id) {
            return;
        }

        //above or below
        if ((spaceA.x0 <= spaceB.x0 && spaceA.x0 >= spaceB.x0 + spaceB.w) || (spaceB.x0 <= spaceA.x0 && spaceB.x0 >= spaceA.x0 + spaceA.w)) {
            if(spaceA.y0 + spaceA.h == spaceB.y0) {
                //spaceA is below spaceB
                spaceB.b.add(spaceA.id);
                spaceA.a.add(spaceB.id);

            }
            else if(spaceB.y0 + spaceB.h == spaceA.y0) {
                //spaceB is below spaceA
                spaceB.a.add(spaceA.id);
                spaceA.b.add(spaceB.id);
            }

        }
        else if ((spaceA.y0 <= spaceB.y0 && spaceA.y0 >= spaceB.y0 + spaceB.h) || (spaceB.y0 <= spaceA.y0 && spaceB.y0 >= spaceA.y0 + spaceA.h)) {
            if(spaceA.x0 + spaceA.w == spaceB.x0) {
                //spaceA is left of spaceB
                spaceB.l.add(spaceA.id);
                spaceA.r.add(spaceB.id);

            }
            else if(spaceB.x0 + spaceB.w == spaceA.x0) {
                //spaceA is left of spaceB
                spaceB.r.add(spaceA.id);
                spaceA.l.add(spaceB.id);
            }

        }
    }

};
