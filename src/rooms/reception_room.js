import { generateRegularPolyRoom } from '~rooms/room_utils'

export class Reception {
    constructor(position) {
        this.position = position;
    }

    buildRoom() {
        let room = document.createElement('a-entity');
        let polygonRoom = generateRegularPolyRoom(8, 5, 10, 1, new THREE.Vector3(0, 0, 0));
        room.appendChild(polygonRoom)

        // add stuff to the room and also store information about where to place frames
        return room;

    }

}
