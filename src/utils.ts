import { PlacedRect } from "~packing/bin";

export interface Point {
    x : number;
    y : number;
}

export class LineSegment {
  start: Point;
  end : Point;

  constructor(start : Point, end : Point) {
    this.start = start;
    this.end = end;

    if (this.start == this.end) {
      throw "Unable to create line";
    }
  }

  isVertical() : boolean {
    return this.start.x == this.end.x;
  }

  isHorizontal() : boolean {
    return this.start.y == this.end.y;
  }
}

export function contains(rect : PlacedRect, point : Point) {
  return point.x <= rect.xe && point.x >= rect.x0 && point.y <= rect.ye && point.y <= rect.y0;
}

export function polarAngle(target : Point, crux : Point = {x: 0, y: 0}) {
  return Math.atan2((target.y - crux.y), (target.x - crux.x)) + 2*Math.PI * Number(target.y < crux.y);
}

export function superImposed(rect : PlacedRect, point : Point)  {
  return (rect.x0 == point.x || rect.xe == point.x) && (rect.y0 == point.y || rect.ye == point.y);
}

export function jsonify(obj, idx : number) {

    if (obj == null || obj == undefined) {
        return "null";
    }

   if(typeof obj.getString == 'function') {
       return obj.getString();
   }

    var json;  
    var objStr = String.call(obj);    

  // Handle strings
  if(objStr == '[object String]') { return '"' + obj + '"' }

  // Handle arrays
  if(objStr == '[object Array]') {
    if(idx >= obj.length) {
      // The code below ensures we'll never go past the end of the array,
      // so we can assume this is an empty array
      return "[]";
    }

    // JSONify the value at idx
    json = jsonify( obj[idx], 0 )

    if(idx < obj.length - 1) {
      // There are items left in the array, so increment the index and
      // JSONify the rest
      json = json + "," + jsonify( obj, idx + 1 )
    }

    // If this is the first item in the array, wrap the result in brackets
    if(idx === 0) { return "[" + json + "]" }

    return json
  }



  // Handle objects
  if(obj === Object(obj)) {

    var keys = Object.keys(obj);
    var key = keys[idx];

    // JSONify the key and value
    json = '"' + key + '":' + jsonify( obj[key], 0 );

    if(idx != 0 && idx < keys.length - 1) {
      // There are more keys, so increment the index and JSONify the rest
      return json + "," + jsonify( obj, idx + 1 );
    }
    else if(idx == 0 && idx < keys.length - 1) {
        json += "," + jsonify(obj, idx + 1);
    } 


    // If this is the first key, wrap the result in curly braces
    if(idx === 0) { return "{" + json + "}" };

    return json;
  }


  return obj.toString() // Naively handle everything else
}


export function EuclideanDistance(x1 : Point, x2 : Point) : number {
    return Math.pow(MSE(x1.x, x2.x) + MSE(x1.y, x2.y), 0.5);
}


function MSE(x1 : number, x2 : number) {
    return Math.pow(x1 - x2, 2);
}

export function rotate(origin : Point, target : Point, angle) : Point {
  var radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (target.x - origin.x)) + (sin * (target.y - origin.y)) + origin.x,
      ny = (cos * (target.y - origin.y)) - (sin * (target.x - origin.x)) + origin.y;
  return {x: nx, y: ny};
}
