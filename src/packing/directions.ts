export enum Direction {
    Above = 0,
    Below = 1,
    Right = 2,
    Left = 3,
    None = 4,
}

export function getOppositeUpper(dir : Direction) : Direction {
    return  (dir - (dir % 2) + 2) % 4 ; 
}

export function getOppositeLower(dir : Direction) : Direction {
    return getOppositeUpper(dir) + 1;
}

export function getOpposite(dir : Direction) : Direction {
    return dir + 1 + -2 * (dir % 2);
}

export function bound(dir : Direction, val1 : number, val2 : number) {
    if(val1 == undefined) {
        return val2;
    }

    return Math.max(val1, val2) * Number(dir % 2 != 0) + Math.min(val1, val2) * Number(dir % 2 == 0); 
}

export function fartherThan(dir : Direction, val1 : number, val2 : number) {
    return (dir % 2 == 1  && val1 < val2) || (dir % 2 == 0 && val1 > val2);
}

export function fartherThanEqual(dir: Direction, val1 : number, val2 : number) {
    return fartherThan(dir, val1, val2) || val1 == val2;
}

export function lessThan(dir : Direction, val1 : number, val2 : number) {
    return !fartherThanEqual(dir, val1, val2);
}

export function lessThanEqual(dir : Direction, val1 : number, val2 : number) {
    return lessThan(dir, val1, val2) || val1 == val2;
}
