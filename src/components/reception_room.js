import { generateRegularPolyRoom } from '~components/room_utils'

export class Reception {
    constructor(position) {
        this.position = position;
    }

    buildRoom() {
        let room = document.createElement('a-entity');
        let polygonRoom = generateRegularPolyRoom(3, 2, 4, 1, new THREE.Vector3(0, 0, 0));
        room.appendChild(polygonRoom)

        // add stuff to the room and also store information about where to place frames
        return room;

    }

}
