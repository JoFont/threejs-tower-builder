import * as THREE from "three";

export class Block {
	constructor(game, props) {
        this.game = game;

        let lastBlock = this.game.group.children[this.game.group.children.length - 1];
        let plane = this.game.state.plane;

        this.props = props || {
            geo: {
                width: lastBlock.geometry.parameters.width,
                height: lastBlock.geometry.parameters.height,
                depth: lastBlock.geometry.parameters.depth
            },
            pos: {
                x: plane.axis === "z" ? lastBlock.position.x - plane.length : lastBlock.position.x,
                y: lastBlock.position.y + lastBlock.geometry.parameters.height,
                z: plane.axis === "x" ? lastBlock.position.z - plane.length : lastBlock.position.z,
            },
            color: {...this.game.state.activeColor}
        };

        this.geometry = new THREE.BoxGeometry(this.props.geo.width, this.props.geo.height, this.props.geo.depth);
		this.material = new THREE.MeshToonMaterial({
			color: `hsl(${this.props.color.h}, ${this.props.color.s}%, ${this.props.color.l}%)`,
			shading: THREE.FlatShading
		});
		this.block = new THREE.Mesh(this.geometry, this.material);
		this.block.position.set(this.props.pos.x, this.props.pos.y, this.props.pos.z);
	}

	add() {
        this.game.group.add(this.block);
	}
}
