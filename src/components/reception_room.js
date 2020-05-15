import { generateRegularPolyRoom } from '~components/room_utils'

export class Reception {
    constructor(position) {
        this.position = position;

    }

    buildRoom() {
        let room = document.createElement('a-entity');
        let polygonRoom = generateRegularPolyRoom(4, 10, 10, 5);
        room.appendChild(polygonRoom)

        // add stuff to the room and also store information about where to place frames
        return room;

    }

}
