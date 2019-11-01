import * as THREE from "three";

const Colors = {
	red: 0xf25346,
	white: 0xd8d0d1,
	brown: 0x59332e,
	pink: 0xf5986e,
	brownDark: 0x23190f,
	blue: 0x68c3c0
};

export class Game {
	constructor(mode, props) {
		this.props = {
			windowWidth: props.width,
			windowHeight: props.height,
			windowPixelRatio: props.pixelRatio
		};

        // Scene
        this.scene = new THREE.Scene();
        
        // Renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });

		this.renderer.setPixelRatio(this.props.pixelRatio);
		this.renderer.setSize(this.props.windowWidth, this.props.windowHeight);
		this.renderer.setClearColor("#D0CBC7", 1);
		this.domNode = document.getElementById("game");
		this.domNode.appendChild(this.renderer.domElement);

		// Camera
		let aspectRatio = this.props.windowWidth / this.props.windowHeight;
		let d = 20;
		this.camera = new THREE.OrthographicCamera(
			-d * aspectRatio,
			d * aspectRatio,
			d,
			-d,
			-100,
			1000
		);
		this.camera.position.x = 2;
		this.camera.position.y = 2;
		this.camera.position.z = 2;
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
		this.scene.add(this.camera);

		// Lights
		this.light = new THREE.DirectionalLight(0xffffff, 0.5);
		this.light.position.set(0, 499, 0);
		this.scene.add(this.light);

		this.softLight = new THREE.AmbientLight(0xffffff, 0.4);
		this.scene.add(this.softLight);

		// Display Axes
		this.axesHelper = new THREE.AxesHelper(100);
		this.scene.add(this.axesHelper);

		// Regarding Blocks
        this.group = new THREE.Group();
        this.scene.add(this.group);

		this.currentBlock = {};
		this.workingPlane = {
			length: 20,
			axis: "z",
			forward: true
		};
		this.blockState = "ACTIVE";
	}

	stage() {
		// Compile Static element
		let props = {
			x: 0,
			y: 0,
			z: 0,
			width: 10,
			height: 2,
			depth: 10
		};

		new Block(this, props).place();
	}

	start() {
		this.renderer.render(this.scene, this.camera);
	}
}

class Block {
	constructor(game, props) {
		this.game = game;
		this.props = {
			x: props.x || 0,
			y: props.y || 0,
			z: props.z || 0,
			width: props.width || 10,
			height: props.height || 2,
			depth: props.depth || 10
		};
		this.geometry = new THREE.BoxGeometry(
			this.props.width,
			this.props.height,
			this.props.depth
		);
		this.material = new THREE.MeshToonMaterial({
			color: Colors.brown,
			shading: THREE.FlatShading
		});
		this.block = new THREE.Mesh(this.geometry, this.material);
		this.block.position.set(this.props.x, this.props.y, this.props.z);
	}

	place() {
        this.game.group.add(this.block);
	}
}
