
export function generateRegularPolyRoom(roomProps) {

    let numWalls = roomProps.numWalls;


    let theta = ((numWalls - 2) * 180.0) / numWalls;
    let distCenter = roomProps.w/2.0 * Math.tan(toRads(theta / 2.0)); //radians or degrees?

    var i;
    let div = document.createElement('a-entity');

    for (i = 0; i < numWalls; ++i) {
        let mtheta = toRads((360.0 / numWalls) * i + 270.0);
        let offset = {x:distCenter*Math.sin(mtheta), y:roomProps.h/2.0, z:distCenter*Math.cos(mtheta)};
        let isDoor = roomProps.wallsWithDoors.indexOf(i) >= 0;
        var physics = "shape: box;";
        var wall;

        if (isDoor) {
            let dwidth = Math.min(3, roomProps.w/2.0);
            var attributes = {
               height: roomProps.h,
               width: roomProps.w,
               depth: roomProps.d,
               doorwidth: dwidth,
               doorheight: Math.min(4, roomProps.h/2.0),
               dooroffset: (roomProps.w - dwidth) / 2.0
            };

            wall = document.createElement('a-entity');
            wall.setAttribute('box-door', attributes);
            wall.components["box-door"].getBoundingBox(wall);
        }
        else {
            wall = document.createElement('a-box');
            wall.setAttribute('height', roomProps.h);
            wall.setAttribute('width', roomProps.w);
            wall.setAttribute('depth', roomProps.d);
            wall.setAttribute('body', 'type: static; shape: none;');
            wall.setAttribute('shape__main', `shape: box; halfExtents: ${roomProps.w/2.0}
            \n${roomProps.h/2.0} ${roomProps.d/2.0}`);
        }


        let position = roomProps.center.clone().add(offset);


        let increment_angle = (180.0 - theta);
        let angles = {x:0, y:(90.00 + increment_angle*i), z:0};

        // configure the wall appropriately

        if (roomProps.addFrames) {
            let centerplane = roomProps.center.clone().setZ(position.z);
            let normal = position.clone().sub(centerplane).normalize().multiplyScalar(-1.0);

            let frames = addFrames({h: roomProps.h, w: roomProps.w, d: roomProps.d, pos: position },
                 {normal: normal, facepoint: normal.clone().multiplyScalar(roomProps.w/2.0).add(position), rot: angles, num: 1, w:0.1});
                appendChildren(wall, frames);
        }

        wall.setAttribute('position', position);
        wall.setAttribute('rotation', angles);

        div.appendChild(wall);

    }

    return div;
}

// returns a layout of frames given a wall (inside)
// frame_plane: position adjusted and the rotation
// compute maximum frame size
function addFrames(wallProps, frameProps) {

    let frames = [];

    let i;

    for(i = 0; i < frameProps.num; ++i) {
        let frame = document.createElement('a-box');
        frame.setAttribute("width", frameProps.w);
        frame.setAttribute("position", new THREE.Vector3(0,0,wallProps.d/2.0));
        frame.setAttribute("rotation", new THREE.Vector3(0, 90, 0));
        frame.setAttribute('static-body', "shape: hull;");
        frames.push(frame);
    };

    return frames;
}

function toRads(degrees) {
    return degrees * Math.PI / 180.0;
}

//this only works for non-rotated, even polys
export function getWidth(w, numWalls) {
    let theta = ((numWalls - 2) * 180.0) / numWalls;
    let angle = (180.0 - theta);
    let width = w/2;
    var i;

    for(i = 1; i <= (numWalls - 2)/4; ++i) {
        width +=  w*Math.cos(toRads(angle * i));
    }

    return width*2;
}

export function appendChildren(parent, childList) {
    childList.forEach(function(child) {
        parent.appendChild(child);
    });
}


//TODO: "fit edge 1 to edge 2 of room B"
// this would be ideal for tile construction
// we would need information on all the centers of the walls and vertices?
