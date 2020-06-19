import { generateRegularPolyRoom } from '~rooms/room_utils'

export class LobbyTile {
    constructor(position) {
        this.position = position;
    }


    buildTile() {
        let room = document.createElement('a-entity');
        let polygonRoom = generateRegularPolyRoom({
            numWalls: 8,
            h: 5,
            w: 20,
            d: 1,
            center: new THREE.Vector3(0, 0, 0),
            wallsWithDoors: [1, 3, 5, 7]
        });

        room.appendChild(polygonRoom)

        // add stuff to the room and also store information about where to place frames
        return room;

    }

}
