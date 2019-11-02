import { r } from "~reddit";

// https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

setInterval(() => {
    document.getElementsByTagName('a-box')[0].setAttribute('color', getRandomColor());
}, 1000);


r.then(r => r.getHot().then(list => list.map(post => post.title)).then(console.log));
