
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
        var physics = "";
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
            physics = "shape: mesh;";
        }
        else {
            wall = document.createElement('a-box');
            wall.setAttribute('height', roomProps.h);
            wall.setAttribute('width', roomProps.w);
            wall.setAttribute('depth', roomProps.d);
        }



        // configure the wall appropriately
        wall.setAttribute('position', roomProps.center.clone().add(offset));
        wall.setAttribute('rotation', {x:0, y:90.00 - theta*i, z:0});
        wall.setAttribute('static-body', physics);
        div.appendChild(wall);
    }

    return div;
}

function toRads(degrees) {
    return degrees * Math.PI / 180.0;
}


//this only works for non-rotated, even polys
export function getWidth(w, numWalls) {
    let theta = ((numWalls - 2) * 180.0) / numWalls;
    let angle = (180.0 - theta)
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
