export enum Direction {
    Above = 1,
    Below = 2,
    Right = 3,
    Left = 4,
    None = 5,
}

export function getOppositeUpper(dir : Direction) : Direction {
    return  (dir - (dir % 2) + 2) % 4 ; 
}

export function getOppositeLower(dir : Direction) : Direction {
    return getOpposite(dir) + 1;
}

export function getOpposite(dir : Direction) : Direction {
    return dir + 1 + -2 * (dir % 2);
}
