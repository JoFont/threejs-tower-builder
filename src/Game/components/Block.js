import * as THREE from "three";
import { TweenMax } from "gsap/all";

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
				x: plane.axis === "z" ? -plane.length : lastBlock.position.x,
				y: lastBlock.position.y + lastBlock.geometry.parameters.height,
				z: plane.axis === "x" ? -plane.length : lastBlock.position.z
			},
			color: { ...this.game.state.activeColor }
		};

		this.geometry = new THREE.BoxGeometry(this.props.geo.width, this.props.geo.height, this.props.geo.depth);
		this.material = new THREE.MeshToonMaterial({
			color: `hsl(${this.props.color.h}, ${this.props.color.s}%, ${this.props.color.l}%)`,
			flatShading: true
		});
		this.block = new THREE.Mesh(this.geometry, this.material);
		this.block.position.set(this.props.pos.x, this.props.pos.y, this.props.pos.z);
	}

	add() {
		this.game.group.add(this.block);
	}

	addRemainder() {
		this.game.scene.add(this.block);
		this.animateRemainder();
	}

	remove() {
		this.geometry.dispose();
		this.material.dispose();
		this.game.scene.remove(this.block);
	}

	animateRemainder() {
		let animationDirection = this.game.state.plane.axis;
		let translate = this.block.position[animationDirection] * 6;
		let rotation = Math.sign(this.block.position[animationDirection]) * 6;

		const removeMethodProxy = () => {
			this.remove();
		};

		removeMethodProxy.bind(this);

		if (animationDirection === "z") {
			TweenMax.to(this.block.position, 2, { z: translate, y: -60, ease: "power1.in" });
			TweenMax.to(this.block.rotation, 2, { x: rotation, ease: "power1.in", onComplete: removeMethodProxy });
		} else {
			TweenMax.to(this.block.position, 2, { x: translate, y: -60, ease: "power1.in" });
			TweenMax.to(this.block.rotation, 2, { z: -rotation, ease: "power1.in", onComplete: removeMethodProxy });
		}
	}
}
