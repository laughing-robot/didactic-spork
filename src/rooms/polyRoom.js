import { Room } from "~rooms/room";
import { generateRegularPolyRoom  } from "~rooms/room_utils"

export class PolyRoom extends Room {

    constructor(roomProps) {
        super(roomProps);
        this.room = null;
        this.margin = 0.25;
        this.padding = 0.5;
    }

    buildRoom() {
        this.room = generateRegularPolyRoom(this.roomProps);
        return this;
    }

    //accept an array of potential posts (their size and dims)
    //given all available walls in our room we apply and tell which ones we can fit
    acceptPosts(submissionData) {

        let subData  = submissionData.clone();

        this.room.children.forEach(function (item, index) {

            for ( i = 0; i < subData.length; ++i ) {

            }

        });
    }

    addFrames(frames, wall) {

    }

    getRoom() {
        return this.room;
    }

}
