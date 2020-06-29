import { getWidth, appendChildren } from '~rooms/room_utils'
import { PolyRoom  } from '~rooms/polyRoom'

export class ArtTile {
    constructor(position) {
        this.position = position;
    };

    roomFactoryGenerator(room_type, roomProps) {

        switch(room_type) {
            case 'octagon':
                return function(mcenter) {
                        return new PolyRoom({
                            numWalls: 8,
                            h: roomProps.tileProps.roomHeight,
                            w: roomProps.wallWidth,
                            d: roomProps.tileProps.roomDepth,
                            center: mcenter,
                            addFrames: true,
                            wallsWithDoors: [0, 2, 4, 6]
                        }).buildRoom().getRoom();
                }
                break;
            case 'rectangle':
                return function(mcenter) {
                    return new PolyRoom({
                            numWalls: 4,
                            h: roomProps.tileProps.roomHeight,
                            w: roomProps.wallWidth,
                            d: roomProps.tileProps.roomDepth,
                            center: mcenter,
                            wallsWithDoors: [0, 2]
                        }).buildRoom().getRoom();
                }
                break;
        };

        throw "RoomNotFound";
    };


    buildTile(tileProps) {
        let room = document.createElement('a-entity');
        let depth = 2;

        //calculate the width of the octagonal rooms
        let width = getWidth(1.0, 8.0);
        let octWidth = Math.min(tileProps.tileHeight, tileProps.tileWidth*3/10)/width;
        let octRoomWidth = octWidth * width;
        let rectWidth = (tileProps.tileWidth - octRoomWidth * 2)/3;
        let octOffset = new THREE.Vector3(octRoomWidth/2 + rectWidth/2,  0, 0);

        let octGen = this.roomFactoryGenerator('octagon', {tileProps: tileProps, wallWidth: octWidth});
        let octRoom1 = octGen(new THREE.Vector3(0, 0, 0).subVectors(tileProps.center, octOffset));
        let octRoom2 = octGen(new THREE.Vector3(0, 0, 0).addVectors(tileProps.center, octOffset));


        let rectMidOffset = new THREE.Vector3(0,0,0);
        let rectEdgeOffset = new THREE.Vector3(rectWidth/2 + octRoomWidth/2,0,0).add(octOffset);
        let rectGen = this.roomFactoryGenerator('rectangle', {tileProps: tileProps, wallWidth: rectWidth});

        let rectRoom1 = rectGen(new THREE.Vector3(0, 0, 0).addVectors(tileProps.center, rectMidOffset));
        let rectRoom2 = rectGen(new THREE.Vector3(0, 0, 0).subVectors(tileProps.center, rectEdgeOffset));
        let rectRoom3 = rectGen(new THREE.Vector3(0, 0, 0).addVectors(tileProps.center, rectEdgeOffset));

        appendChildren(room, [octRoom1, octRoom2, rectRoom1, rectRoom2, rectRoom3]);

        // add stuff to the room and also store information about where to place frames
        return room;
    };
};

