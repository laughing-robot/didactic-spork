function seed(s: number) {
    return () => {
        s = Math.sin(s) * 10000; return s - Math.floor(s);
    };
}

const colorRandom = seed(1);
function getRandomGray(): string {
    const colors = ['gainsboro', 'lightgray', 'silver', 'darkgray', 'gray', 'dimgray', 'lightslategray', 'slategray'];
    return colors[Math.floor(colorRandom() * colors.length)];
}


function placeBuildings(min_radius: number, max_radius: number, min_height: number, max_height: number) {
    const random = seed(1);
    for (let i = 0; i < 10; i++) {
        let radians = (random() - 0.5) * 2 * Math.PI;
        let radius = random() * (max_radius - min_radius) + min_radius;
        let x = Math.cos(radians) * radius;
        let y = Math.sin(radians) * radius;

        let height = random() * (max_height - min_height) + min_height;

        const child = document.createElement('a-box');
        child.setAttribute('color', getRandomGray());
        child.setAttribute('depth', '5');
        child.setAttribute('width', '5');
        child.setAttribute('height', `${height}`);
        child.setAttribute('position', `${x} 0 ${y}`)
        document.getElementsByTagName('a-scene')[0].appendChild(child);
    }
}

export { placeBuildings };
