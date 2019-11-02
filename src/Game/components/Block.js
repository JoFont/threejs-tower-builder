import * as THREE from "three";
import { TweenMax, Power2, TimelineLite } from "gsap/all"; 


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
        // console.log(this.props);
        this.geometry = new THREE.BoxGeometry(this.props.geo.width, this.props.geo.height, this.props.geo.depth);
		this.material = new THREE.MeshToonMaterial({
			color: `hsl(${this.props.color.h}, ${this.props.color.s}%, ${this.props.color.l}%)`,
			flatShading : true
		});
		this.block = new THREE.Mesh(this.geometry, this.material);
		this.block.position.set(this.props.pos.x, this.props.pos.y, this.props.pos.z);
	}

	add() {
        this.game.group.add(this.block);
        // console.log(this.geometry);
        // console.log(this.block);
        // console.log(this.block.geometry.parameters);
        
    }
    
    addRemainder() {
        this.game.scene.add(this.block);

        let animationDirection = this.game.state.plane.axis;
        let translate = this.block.position[animationDirection] * 3;

        if(animationDirection === "z") {
            TweenMax.to(this.block.position, 2, {z:translate, y:-50});
            TweenMax.to(this.block.rotation, 2, {x:6, onComplete:deleteBlock});
        } else {
            TweenMax.to(this.block.position, 2, {x:translate, y:-50});
            TweenMax.to(this.block.rotation, 2, {z:-6, onComplete:deleteBlock});
        }
        

        let block = this.block;
        let geo = this.geometry;
        let mat = this.material;
        let sc = this.game.scene;

        function deleteBlock() {
            geo.dispose();
            mat.dispose();
            sc.remove(block);
            console.log("DELETED");
        }
    }

    animateRemainder() {
        
    }

}
