
export function generateRegularPolyRoom(roomProps) {

    let numWalls = roomProps.numWalls;


    let theta = ((numWalls - 2) * 180.0) / numWalls;
    let distCenter = roomProps.w/2.0 * Math.tan(toRads(theta / 2.0)); //radians or degrees?

    var i;
    let div = document.createElement('a-entity');

    for (i = 0; i < numWalls; ++i) {
        let mtheta = toRads((360.0 / numWalls) * i + 270.0);
        let isDoor = roomProps.wallsWithDoors.indexOf(i) >= 0;
        var physics = "";

        if (isDoor) {
            var wall = document.createElement('a-entity');
            wall.setAttribute('box-door', "");
            physics = "shape: mesh;";
        }
        else {
            var wall = document.createElement('a-box');
        }



        // compute the offset and angle
        let offset = {x:distCenter*Math.sin(mtheta), y:roomProps.h/2.0, z:distCenter*Math.cos(mtheta)};

        // configure the wall appropriately
        wall.setAttribute('height', roomProps.h);
        wall.setAttribute('width', roomProps.w);
        wall.setAttribute('depth', roomProps.d);
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

