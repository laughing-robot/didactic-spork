import { r } from "~reddit";
import { Submission } from "snoowrap";
import { placeBuildings } from "~random";
import { tileFactory  } from "~builder/tile_factory"

function isSuitableSubmission(submission: Submission): boolean {
    return !submission.over_18 && submission.thumbnail_height !== null && submission.thumbnail_width !== null
        && submission.thumbnail.indexOf('://') >= 0;
}

function appendSubmissionToAssets(submission: Submission) {
    const assets = document.getElementsByTagName('a-assets')[0];
    const child = document.createElement("image");
    child.setAttribute("id", `#${submission.id}`)
    child.setAttribute("srcset", `${submission.thumbnail} ${submission.thumbnail_width}w, ${submission.url}`)
    assets.appendChild(child);
}

// r.then(r => r.getHot()).then(submissions =>
//     submissions.filter(isSuitableSubmission).forEach(appendSubmissionToAssets)
// ).catch(err => {
// })

document.addEventListener("DOMContentLoaded", () => {
    if (document.location.hostname === 'localhost') {
        document.getElementsByTagName('a-scene')[0].setAttribute('stats', '');
    }

    placeBuildings(20, 100, 50, 100);
    
    let elem = tileFactory({
        room_type: "art_tile",
        roomHeight: 5,
        roomDepth: 1, 
        tileWidth: 100,
        tileHeight: 50,
        center: new THREE.Vector3(0,0,0)
    });

    let ascene = document.getElementsByTagName('a-scene')[0];
    ascene.appendChild(elem);

    setTimeout(function() {

    let item = document.getElementById("kek");
    item.setAttribute("width", 100);
    console.log(item);

    }, 4000);

    //    one method of adding strings to the world                 //
    //    let innerHTML = roomFactory('FrontDesk')('None');
    //    let ascene = document.getElementsByTagName('a-scene')[0];
    //    console.log(innerHTML);
    //    console.log(ascene.innerHTML)
    //    let newcontent = document.createElement('a-entity');
    //    newcontent.innerHTML = innerHTML;
    //    let aboxar = newcontent.getElementsByTagName('a-sphere')[0]
    //    aboxar.setAttribute('color', 'purple')
    //    ascene.appendChild(newcontent)
    //
}, false);


