export function generateRegularPolyRoom(numberOfWalls, h, w, d, center) {

    let wall_color = ['white', 'red', 'blue', 'orange', 'red'];

    let theta = ((numberOfWalls - 2) * 180.0) / numberOfWalls;
    let distCenter = w/2.0 * Math.tan(toRads(theta / 2.0)); //radians or degrees?

    var i;
    let div = document.createElement('a-entity');

    for (i = 0; i < numberOfWalls; ++i) {
        let mtheta = toRads((360.0 / numberOfWalls) * i + 270.0);
        let wall = document.createElement('a-box');

        // compute the offset and angle
        let offset = {x:distCenter*Math.sin(mtheta), y:0, z:distCenter*Math.cos(mtheta)};
        console.log(theta)
        console.log(offset)


        // configure the wall appropriately
        wall.setAttribute('height', h);
        wall.setAttribute('width', w);
        wall.setAttribute('depth', d);
        wall.setAttribute('position', center.clone().add(offset));
        wall.setAttribute('rotation', {x:0, y:90.00 - theta*i, z:0});
        wall.setAttribute('color', wall_color[i])
        div.appendChild(wall);
    }

    return div;
}

function toRads(degrees) {
    return degrees * Math.PI / 180.0;
}

