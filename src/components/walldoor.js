function recreate_walldoor(el, data, obj) {
    let box1width = data.dooroffset;
    let box2width = (data.width - data.doorwidth - data.dooroffset);
    let box3width = data.doorwidth;
    let box3height = data.height - data.doorheight;

    let box1offset = box1width / 2.0 - data.width / 2.0;
    let box3offset = box1width / 2.0 + box3width / 2.0 + box1offset;
    let box2offset = box3offset + box3width/2.0 + box2width/2.0;
    let box3heightoffset = data.doorheight/2.0;

    // d, h, w
    box1geo = new THREE.BoxGeometry(data.depth, data.height, box1width);
    box1geo.translate(0, 0, box1offset)

    box2geo = new THREE.BoxGeometry(data.depth, data.height, box2width);
    box2geo.translate(0, 0, box2offset);

    box3geo = new THREE.BoxGeometry(data.depth, box3height, data.doorwidth);
    box3geo.translate(0, box3heightoffset, box3offset);

    box1mesh = new THREE.Mesh(box1geo);
    box2mesh = new THREE.Mesh(box2geo);
    box3mesh = new THREE.Mesh(box3geo);


    obj.geometry = new THREE.Geometry();
    obj.geometry.merge(box1mesh.geometry, box1mesh.matrix);
    obj.geometry.merge(box2mesh.geometry, box2mesh.matrix);
    obj.geometry.merge(box3mesh.geometry, box3mesh.matrix);
    obj.geometry.rotateY(Math.PI/2.0);

 //   obj.geometry = new THREE.Geometry();

 //   obj.geometry.vertices.push(
 //   new THREE.Vector3( -10,  10, 0 ),
 //   new THREE.Vector3( -10, -10, 0 ),
 //   new THREE.Vector3(  10, -10, 0 )
 //   );

 //   obj.geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );

    obj.material = new THREE.MeshBasicMaterial( { color: data.color} );
    obj.mesh = new THREE.Mesh(obj.geometry, obj.material);
    el.setObject3D('mesh', obj.mesh);
}

AFRAME.registerComponent('box-door', {

schema: {
    width: {type: 'number', default: 10},
    height: {type: 'number', default: 5},
    depth: {type: 'number', default: 1},
    doorwidth: {type: 'number', default: 3},
    doorheight: {type: 'number', default: 4},
    dooroffset: {type: 'number', default: 3.5},
    color: {type: 'color', default: '#AAA'}
  },

init: function () {
    var data = this.data;
    var el = this.el;
    recreate_walldoor(el, data, this);

    this.el.addEventListener('componentChanged',function(e){
        console.log("LISTENER TRIGGERED");
    });

  },

    /*
   * Update the mesh in response to property updates.
   */
  update: function (oldData) {
    var data = this.data;
    var el = this.el;

    console.log("UPDATE FUNCTION HIT...");

    // If `oldData` is empty, then this means we're in the initialization process.
    // No need to update.
    if (Object.keys(oldData).length === 0) { console.log("exit"); return; }

    // Geometry-related properties changed. Update the geometry.
    if (data.width !== oldData.width ||
        data.height !== oldData.height ||
        data.depth !== oldData.depth) {
        console.log("DIMENSION CHANGE DETECTED");
        recreate_walldoor(el, data, this);
    }

    // Material-related properties changed. Update the material.
    if (data.color !== oldData.color) {
      el.getObject3D('mesh').material.color = data.color;
    }
  }
});
