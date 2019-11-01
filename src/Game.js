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
        
        this.camera.position.set(2, 2, 2);
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

        this.state = {
            activeBlock: {},
            lastBlock: {},
            plane: {
                length: 20,
                axis: "z",
                forward: true
            },
            blockState: "ACTIVE"
        }

		this.activeBlock = {};
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

        let props2 = {
            x: 0,
			y: 2,
			z: 0,
			width: 10,
			height: 2,
			depth: 10
        }

        new Block(this, props).add();
        new Block(this, props2).add();
        this.setActiveBlock();
	}   

	start() {
		this.renderer.render(this.scene, this.camera);
    }
    
    placeBlock() {

        this.state.blockState = "PLACING";

        this.state.lastBlock = this.group.children[this.group.children.length - 2];


        let lastBlockProps = this.extractBlockProps(this.state.lastBlock);
        let activeBlockProps = this.extractBlockProps(this.state.activeBlock);

        let newBlockProps = {};
        
        if (this.state.plane.axis === "x" && activeBlockProps.x - lastBlockProps.x > 0 || this.workingPlane.axis === "z" && activeBlockProps.z - lastBlockProps.z > 0) {

            newBlockProps = this.calcNewBlockProps(this.state.lastBlock, this.state.activeBlock, true);
        } else {
            newBlockProps = this.calcNewBlockProps(this.state.lastBlock, this.state.activeBlock, false);
        }

        this.group.remove(this.state.activeBlock);
        this.scene.remove(this.state.activeBlock);
        new Block(this, newBlockProps).add();
        new Block(this).add();
        this.setActiveBlock();

        this.group.position.y -= 2;
        this.state.plane.axis === "x" ? this.state.plane.axis = "z" : this.state.plane.axis = "x";

        this.state.blockState = "ACTIVE";
    }

    setActiveBlock() {
        this.state.activeBlock = this.group.children[this.group.children.length - 1];
    }

    extractBlockProps(block) {
        return {
            width: block.geometry.parameters.width,
            height: block.geometry.parameters.height,
            depth: block.geometry.parameters.depth,
            x: block.position.x,
            y: block.position.y,
            z: block.position.z 
        }
    }

    calcNewBlockProps(lastBlock, activeBlock, positiveSide) {
        let lastBlockProps = this.extractBlockProps(lastBlock);
        let activeBlockProps = this.extractBlockProps(activeBlock);

        let calculatedProps = {};

        // Calculate Geometry & Position
        if(positiveSide) {
            calculatedProps = {
                width: lastBlockProps.width - activeBlockProps.x + lastBlockProps.x,
                height: lastBlockProps.height,
                depth: lastBlockProps.depth - activeBlockProps.z + lastBlockProps.z,
            }

            calculatedProps.x = activeBlockProps.x - ((activeBlockProps.width - calculatedProps.width) / 2);

            calculatedProps.y = activeBlockProps.y;

            calculatedProps.z = activeBlockProps.z - ((activeBlockProps.depth - calculatedProps.depth) / 2);

        } else {
            calculatedProps = {
                width: lastBlockProps.width + activeBlockProps.x - lastBlockProps.x,
                height: lastBlockProps.height,
                depth: lastBlockProps.depth + activeBlockProps.z - lastBlockProps.z,
            }

            calculatedProps.x = activeBlockProps.x + ((activeBlockProps.width - calculatedProps.width) / 2);

            calculatedProps.y = activeBlockProps.y;

            calculatedProps.z = activeBlockProps.z + ((activeBlockProps.depth - calculatedProps.depth) / 2);
        }

        return calculatedProps;
    }
}

class Block {
	constructor(game, props) {
        this.game = game;
        this.props;

        let lastBlock = this.game.group.children[this.game.group.children.length - 1];

        let plane = this.game.state.plane;

        if(!props) {
            this.props = {
                x: plane.axis === "z" ? lastBlock.position.x - plane.length : lastBlock.position.x,
                y: lastBlock.position.y + lastBlock.geometry.parameters.height,
                z: plane.axis === "x" ? lastBlock.position.z - plane.length : lastBlock.position.z,
                width: lastBlock.geometry.parameters.width,
                height: lastBlock.geometry.parameters.height,
                depth: lastBlock.geometry.parameters.depth
            }
        } else {
            this.props = {
                x: props.x || 0,
                y: props.y || 0,
                z: props.z || 0,
                width: props.width || 10,
                height: props.height || 2,
                depth: props.depth || 10
            };
        }
		
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

	add() {
        this.game.group.add(this.block);
	}
}
