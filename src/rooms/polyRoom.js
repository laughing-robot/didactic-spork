import { Room } from "~rooms/room";
import { generateRegularPolyRoom  } from "~rooms/room_utils"

export class PolyRoom extends Room {

    constructor(roomProps) {
        super(roomProps);
        this.room = null;
    }

    buildRoom() {
        this.room = generateRegularPolyRoom(this.roomProps);
        return this;
    }

    acceptPosts(postData) {

    }

    getRoom() {
        return this.room;
    }

}
