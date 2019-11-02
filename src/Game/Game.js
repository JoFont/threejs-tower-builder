import * as THREE from "three";
import { Utils } from "../Utils/Utils";
import { Block } from "./components/Block";
import { GameUi } from "./components/GameUi";


export class Game {
	constructor(mode, props) {
        this.mode = mode || "single-player";
		this.props = {
			windowWidth: props.width,
			windowHeight: props.height,
			windowPixelRatio: props.pixelRatio
        };
        
        this.id = Utils.generateID();
        // DOM
        this.$parentNode = document.getElementById("game-container");
        this.$domNode = document.createElement("div");
        this.$domNode.setAttribute("id", this.id);
        this.$parentNode.appendChild(this.$domNode);

        this.ui = new GameUi("game-ui", this.id, this);

        // Scene
        this.scene = new THREE.Scene();
        
        // Renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });

		this.renderer.setPixelRatio(this.props.pixelRatio);
		this.renderer.setSize(this.props.windowWidth, this.props.windowHeight);
		this.renderer.setClearColor("#D0CBC7", 1);
		
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
		
		// Lights
		this.light = new THREE.DirectionalLight(0xffffff, 0.5);
		this.light.position.set(0, 499, 0);
		this.softLight = new THREE.AmbientLight(0xffffff, 0.4);

		// Display Axes
		// this.axesHelper = new THREE.AxesHelper(100);

		// Regarding Blocks
        this.group = new THREE.Group();
        
        this.state = {
            activeBlock: {},
            lastBlock: {},
            plane: {
                length: 20,
                axis: "z",
                forward: true
            },
            blockState: "ACTIVE",
            activeColor: {
                h: 70,
                s: 100,
                l: 78,
            },
            score: 0
        };
	}

	stage() {
		// Compile Static element
		let baseProps = {
            pos: {
                x: 0,
                y: 0,
                z: 0
            },
            geo: {
                width: 10,
                height: 2,
                depth: 10
            },
            color: {
                h: 70,
                s: 10,
                l: 21
            }
        };

        let firstBlockProps = {
            pos: {
                x: 0,
                y: 2,
                z: 0
            },
            geo: {
                width: 10,
                height: 2,
                depth: 10
            }
        };
        
        firstBlockProps.color = this.state.activeColor;

        this.ui.render();
        this.ui.renderScore();
        this.$domNode.appendChild(this.renderer.domElement);
        
        this.scene.add(this.camera);
        this.scene.add(this.light);
        this.scene.add(this.softLight);
        this.scene.add(this.axesHelper);
        this.scene.add(this.group);

        new Block(this, baseProps).add();
        new Block(this, firstBlockProps).add();
        this.setActiveBlock();
	}   

    // TODO: FIX THIS FOR SIDE BY SIDE GAME
    updateSize() {
        let viewSize = 30;
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.left = window.innerWidth / -viewSize;
        this.camera.right = window.innerWidth / viewSize;
        this.camera.top = window.innerHeight / viewSize;
        this.camera.bottom = window.innerHeight / -viewSize;
        this.camera.updateProjectionMatrix();
    }

	render() {
		this.renderer.render(this.scene, this.camera);
    }
    
    placeBlock() {
        this.setBlockState("PLACING");

        this.state.lastBlock = this.group.children[this.group.children.length - 2];


        let lastBlockProps = this.extractBlockProps(this.state.lastBlock);
        let activeBlockProps = this.extractBlockProps(this.state.activeBlock);

        let placeBlockProps = {};
        let remainingBlock = {}
        
        if (this.state.plane.axis === "x" && activeBlockProps.pos.x - lastBlockProps.pos.x > 0 || this.state.plane.axis === "z" && activeBlockProps.pos.z - lastBlockProps.pos.z > 0) {
            placeBlockProps = this.calcPlacedBlockProps(lastBlockProps, activeBlockProps, true);
            remainingBlock = this.calcRemainingBlockProps(lastBlockProps, placeBlockProps, true);

        } else {
            placeBlockProps = this.calcPlacedBlockProps(lastBlockProps, activeBlockProps, false);
            remainingBlock = this.calcRemainingBlockProps(lastBlockProps, placeBlockProps, false);
        }

        console.log(remainingBlock)

        if(placeBlockProps.geo.width <= 0 || placeBlockProps.geo.depth <= 0) {
            console.log("lost")
            this.handleGameLoss();
        } else {
            // Dispose of Old Block
            this.state.activeBlock.material.dispose();
            this.state.activeBlock.geometry.dispose();
            this.group.remove(this.state.activeBlock);
            this.scene.remove(this.state.activeBlock);

            this.updateScore(1);
            // Place Block
            new Block(this, placeBlockProps).add();
            new Block(this, remainingBlock).addRemainder();

            // Create new Block
            this.createNewLayer();
        }
    }

    createNewLayer() {
        this.incrementHue();
        new Block(this).add();
        this.setActiveBlock();

        this.group.position.y -= 2;
        this.switchPlaneAxis();

        this.setBlockState("ACTIVE");
    }

    setBlockState(newState) {
        this.state.blockState = newState;
    }

    setActiveBlock() {
        this.state.activeBlock = this.group.children[this.group.children.length - 1];
    }

    switchPlaneAxis() {
        this.state.plane.axis === "x" ? this.state.plane.axis = "z" : this.state.plane.axis = "x";
    }

    incrementHue() {
        this.state.activeColor.h + 10 >= 359 ? this.state.activeColor.h = 0 : this.state.activeColor.h += 10;
    }

    updateScore(value) {
        this.state.score += value;
        this.ui.updateUiScore(this.state.score);
    }

    extractBlockProps(block) {
        return {
            pos: {
                x: block.position.x,
                y: block.position.y,
                z: block.position.z 
            },
            geo: {
                width: block.geometry.parameters.width,
                height: block.geometry.parameters.height,
                depth: block.geometry.parameters.depth,
            }
        }
    }

    calcPlacedBlockProps(last, active, positiveSide) {
        let calculatedProps = {};
        
        // Calculate Geometry & Position
        if(positiveSide) {
            calculatedProps.geo = {
                width: last.geo.width - active.pos.x + last.pos.x,
                height: last.geo.height,
                depth: last.geo.depth - active.pos.z + last.pos.z,
            }

            calculatedProps.pos = {
                x: active.pos.x - ((active.geo.width - calculatedProps.geo.width) / 2),
                y: active.pos.y,
                z: active.pos.z - ((active.geo.depth - calculatedProps.geo.depth) / 2)
            }

        } else {
            calculatedProps.geo = {
                width: last.geo.width + active.pos.x - last.pos.x,
                height: last.geo.height,
                depth: last.geo.depth + active.pos.z - last.pos.z,
            }

            calculatedProps.pos = {
                x: active.pos.x + ((active.geo.width - calculatedProps.geo.width) / 2),
                y: active.pos.y,
                z: active.pos.z + ((active.geo.depth - calculatedProps.geo.depth) / 2)
            }
        }

        calculatedProps.color = {...this.state.activeColor}

        return calculatedProps;
    }

    calcRemainingBlockProps(last, chopped, positiveSide) {
        let calculatedProps = {};

        let subtractedGeo = {
            width: last.geo.width - chopped.geo.width,
            depth: last.geo.depth - chopped.geo.depth
        }

        calculatedProps.geo = {
            width: subtractedGeo.width === 0 ? last.geo.width : subtractedGeo.width,
            height: last.geo.height,
            depth: subtractedGeo.depth === 0 ? last.geo.depth : subtractedGeo.depth,
        }

        if(positiveSide) {
            calculatedProps.pos = {
                x: subtractedGeo.width === 0 ? chopped.pos.x : chopped.pos.x + ((chopped.geo.width +  calculatedProps.geo.width )/ 2),
                y: 2, 
                z: subtractedGeo.depth === 0 ? chopped.pos.z : chopped.pos.z + ((chopped.geo.depth +  calculatedProps.geo.depth )/ 2)
            } 
        } else {  
            calculatedProps.pos = {
                x: subtractedGeo.width === 0 ? chopped.pos.x : chopped.pos.x - ((chopped.geo.width +  calculatedProps.geo.width )/ 2),
                y: 2, 
                z: subtractedGeo.depth === 0 ? chopped.pos.z : chopped.pos.z - ((chopped.geo.depth +  calculatedProps.geo.depth )/ 2)
            }
        }

        calculatedProps.color = {...this.state.activeColor}

        return calculatedProps;
    }

    handleGameLoss() {

    }
}

