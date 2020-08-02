import { FreeSpace } from "~packing/bin";
import { Proposal } from "~packing/spaceallocator";

export function log(obj : object, mtype : string = 'class') {
    let str = "no message";

    if (obj == null) {
        console.log("log: null");
        return;
    }

    switch(mtype) {
            case 'Proposal':
                str = logProposal(obj as Proposal)
                break;
    }

    console.log(str);
}


function logProposal(prop : Proposal) {
    let str = "width: " + prop.rect.w + ", height: " + prop.rect.h + "\n";
    prop.spaces.forEach((space : FreeSpace, id) => {
        str += logFreeSpace(space);
    });

    return str;
}


function logFreeSpace(space : FreeSpace) {
    return space.toString() + "\n";
}
