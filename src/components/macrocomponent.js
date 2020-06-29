import "~/utils.js"

// *** WARNING DEPRECIATED ***
// class that accepts a series of "components" (aframe entities)
// manages their location, translation, and rotation
class MacroComponent() {

    constructor(props) {
        this.name = props;
        this.center = props.center;
        this.angle= props.angle;
        this.components = {};
        this.div = document.createElement('a-entity');

        if (this.props.components != null) {
            this.components = this.props.components;

            for (const [key, value] of Object.entries(this.components)) {
                this.div.appendChild(value);
            }
        }

    }

    setCenter(center) {
        this.center = center;
    }

    rotateZTo(angle) {
        this.rotateZ(angle - this.angle);
        this.angle = angle;
    }

    // set the entire component to the desired angle
    rotateZ(delta) {
        for (const [key, value] of Object.entries(this.components)) {

            if (typeof value == MacroComponent) {
                //sub-macrocomponent
                value.rotate(value.angle + delta);
                raw_center = value.center().clone().sub(this.center);
                raw_center.applyAxisAngle(zunit, delta);

                value.move(raw_center);
            }
            else {
                //native aframe component
                value.setAttribute("rotation", value.getAttribute("rotation") + delta);

            }
        }
    }

    move(new_center) {
        this.translate(new_center.clone().sub(this.center));
    }

    translate(delta) {
        for (const [key, value] of Object.entries(this.components)) {
            if (typeof value == MacroComponent) {
                value.translate(delta);
            }
            else {
                pos = value.getAttribute("position").split(" ").map(Number);
                vector = new THREE.Vector3(0, 0, 0).fromArray(pos);
                vector.add(delta);
                value.setAttribute(vector.toArray().map(String).join(" "));

            }
        }
    }

    registerComponent(name, component) {
        this.div.appendChild(wall);
        this.components[name] = component;
    }

    getComponents() {
        return this.components;
    }

    getEntity() {
        return this.div;
    }
}
