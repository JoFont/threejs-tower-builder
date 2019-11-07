import * as THREE from "three";

export class DisplayBlock {
    constructor(group, props) {
        this.group = group;
        this.props = props;

        this.geometry = new THREE.BoxGeometry(this.props.geo.width, this.props.geo.height, this.props.geo.depth);

        this.material = new THREE.MeshToonMaterial({
			color: `hsl(${this.props.color.h}, ${this.props.color.s}%, ${this.props.color.l}%)`,
			flatShading : true
        });
        
        this.block = new THREE.Mesh(this.geometry, this.material);
		this.block.position.set(this.props.pos.x, this.props.pos.y, this.props.pos.z);
    }

    add() {
        this.group.add(this.block); 
    }

    remove() {
        this.geometry.dispose();
        this.material.dispose();
    }
}