export function jsonify(obj, idx : number) {

    if (obj == null || obj == undefined) {
        return "null";
    }

   if(typeof obj.getString == 'function') {
       return obj.getString();
   }

  var json, objStr = toString.call(obj);

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
