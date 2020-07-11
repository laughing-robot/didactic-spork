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

    this.create_walldoor();

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

    // If `oldData` is empty, then this means we're in the initialization process.
    // No need to update.
    if (Object.keys(oldData).length === 0) { return; }

    // Geometry-related properties changed. Update the geometry.
    if (data.width !== oldData.width ||
        data.height !== oldData.height ||
        data.depth !== oldData.depth) {
        console.log("DIMENSION CHANGE DETECTED");
        this.create_walldoor();
    }

    // Material-related properties changed. Update the material.
    if (data.color !== oldData.color) {
      el.getObject3D('mesh').material.color = data.color;
    }
  },

    setBoundingBox: function(el) {

        let dims = this.computeBoxDims();

        let constructShapeString = function(dims) {
            return `shape: box; halfExtents: ${dims.depth/2} ${dims.height/2} ${dims.width/2};
            \ offset: ${dims.offset.x} ${dims.offset.z}, ${dims.offset.y};`
        }


        // let physics_box = {
        //     body: "type: static; mass: 5; shape: none;",
        //     shape1: "shape: box; halfExtents: 5 5 5; offsets: 0 0 0;",
        //     shape1: "shape: box; halfExtents: 5 5 5; offsets: 0 0 0;",
        //     shape1: "shape: box; halfExtents: 5 5 5; offsets: 0 0 0;",
        // };
        //
        //

        el.setAttribute("body", "type: static; shape: none;");
        el.setAttribute("shape__main",  constructShapeString(dims['box1']));
        el.setAttribute("shape__side",  constructShapeString(dims['box2']));
        el.setAttribute("shape__otherside", constructShapeString(dims['box3']));

        return el;
    },

    computeBoxDims: function() {

        let data = this.data;

        if (this.data) {
            data = this.data
        }
         else {
             data = this.attrValue;
         }

        let arrangeDims = function(dims, offset) {
            return {width: dims[0], height: dims[1], depth: dims[2], offset: {x: offset[0], z:offset[1], y:offset[2]}};
        };

        let box1width = data.dooroffset;
        let box2width = (data.width - data.doorwidth - data.dooroffset);
        let box3width = data.doorwidth;
        let box3height = data.height - data.doorheight;

        let box1offset = box1width / 2.0 - data.width / 2.0;
        let box3offset = box1width / 2.0 + box3width / 2.0 + box1offset;
        let box2offset = box3offset + box3width/2.0 + box2width/2.0;
        let box3heightoffset = data.doorheight/2.0;

        let boxdims = {};

        boxdims['box1'] = arrangeDims([data.depth, data.height, box1width], [box1offset, 0, 0]);
        boxdims['box2'] = arrangeDims([data.depth, data.height, box2width], [box2offset, 0, 0]);
        boxdims['box3'] = arrangeDims([data.depth, box3height, data.doorwidth], [box3offset, box3heightoffset, 0]);

        return boxdims;
    },

    create_walldoor: function () {

        let generateBoxGeo = function (dims) {
            let boxgeo = new THREE.BoxGeometry(dims.depth, dims.height, dims.width);
            boxgeo.translate(dims.offset.x, dims.offset.z, dims.offset.y);

            return boxgeo;
        }

    let el = this.el;
    let data = this.data;

    let dims = this.computeBoxDims();

    // d, h, w
    box1geo = generateBoxGeo(dims['box1']);
    box2geo = generateBoxGeo(dims['box2']);
    box3geo = generateBoxGeo(dims['box3']);


    // box3geo = new THREE.BoxGeometry(data.depth, box3height, data.doorwidth);
    // box3geo.translate(0, box3heightoffset, box3offset);

    box1mesh = new THREE.Mesh(box1geo);
    box2mesh = new THREE.Mesh(box2geo);
    box3mesh = new THREE.Mesh(box3geo);


    this.geometry = new THREE.Geometry();
    this.geometry.merge(box1mesh.geometry, box1mesh.matrix);
    this.geometry.merge(box2mesh.geometry, box2mesh.matrix);
    this.geometry.merge(box3mesh.geometry, box3mesh.matrix);
    //this.geometry.rotateY(3*Math.PI/2.0);

 //   this.geometry = new THREE.Geometry();

 //   this.geometry.vertices.push(
 //   new THREE.Vector3( -10,  10, 0 ),
 //   new THREE.Vector3( -10, -10, 0 ),
 //   new THREE.Vector3(  10, -10, 0 )
 //   );

 //   this.geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );

    this.material = new THREE.MeshBasicMaterial( { color: data.color} );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    el.setObject3D('mesh', this.mesh);
}


});
