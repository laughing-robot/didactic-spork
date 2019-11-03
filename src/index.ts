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

r.then(r => r.getHot()).then(posts =>
    posts
        .filter(post => !post.over_18)
        .filter(post => post.thumbnail_width && post.thumbnail_height)
        .filter(post => post.thumbnail.indexOf('://') >= 0)
).then(posts =>
    posts.forEach(post => {
        const assets = document.getElementsByTagName('a-assets')[0];
        const child = document.createElement("image");
        child.setAttribute("id", `#${post.id}`)
        child.setAttribute("srcset", `${post.thumbnail} ${post.thumbnail_width}w, ${post.url}`)
        assets.appendChild(child);
    })
);

if (document.location.hostname === 'localhost') {
    document.getElementsByTagName('a-scene')[0].setAttribute('stats', '');
}
