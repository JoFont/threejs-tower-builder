import * as THREE from "three";
import { TweenMax, Expo } from "gsap/all"; 
import { Utils } from "../utils/utils";
import { Block } from "./components/Block";
import { GameUi } from "./components/GameUi";
// import { ScreenShake } from "./components/ScreenShake";

export class Game {
	constructor(mode, props, user) {
        this.mode = mode || "single-player";
        this.user = user;
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
                length: 15,
                axis: "z",
                forward: true
            },
            blockState: "ACTIVE",
            activeColor: {
                h: 70,
                s: 100,
                l: 78,
            },
            score: 0,
            speed: 0.2,
            lost: false,
            tower: []
        };

        this.screenShake = this.ScreenShake();
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
                z: -15
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
        // this.scene.add(this.axesHelper);
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
        this.screenShake.update(this.camera);
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


        if(placeBlockProps.geo.width <= 0 || placeBlockProps.geo.depth <= 0) {
            this.handleGameLoss(activeBlockProps);
        } else {
            // Dispose of Old Block
            this.screenShake.shake(this.camera, new THREE.Vector3(0.8, 0.8, 0), 200);

            this.state.activeBlock.material.dispose();
            this.state.activeBlock.geometry.dispose();
            this.group.remove(this.state.activeBlock);
            this.scene.remove(this.state.activeBlock);

            this.updateScore(1);
            // Place Block
            this.state.speed += 0.01;
            new Block(this, placeBlockProps).add();
            this.state.tower.push(placeBlockProps);
            new Block(this, remainingBlock).addRemainder();
            // Create new Block
            const createNewLayerProxy = () => {
                this.createNewLayer();
            };

            createNewLayerProxy.bind(this);

            let newGroupPos = this.group.position.y - 2;
            TweenMax.to(this.group.position, 0.1, {y: newGroupPos, onComplete:createNewLayerProxy});
        } 
    }

    createNewLayer() {
        
        this.incrementHue();
        new Block(this).add();
        this.setActiveBlock();

        // this.group.position.y -= 2;
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
        // TODO: REFACTOR THIS WITH DINAMIC OPERATOR SIGNS AND AXIS
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
            width: subtractedGeo.width <= 0 ? last.geo.width : subtractedGeo.width,
            height: last.geo.height,
            depth: subtractedGeo.depth <= 0 ? last.geo.depth : subtractedGeo.depth,
        }

        if(positiveSide) {
            calculatedProps.pos = {
                x: subtractedGeo.width <= 0 ? chopped.pos.x : chopped.pos.x + ((chopped.geo.width +  calculatedProps.geo.width )/ 2),
                y: 2, 
                z: subtractedGeo.depth <= 0 ? chopped.pos.z : chopped.pos.z + ((chopped.geo.depth +  calculatedProps.geo.depth )/ 2)
            } 
        } else {  
            calculatedProps.pos = {
                x: subtractedGeo.width <= 0 ? chopped.pos.x : chopped.pos.x - ((chopped.geo.width +  calculatedProps.geo.width )/ 2),
                y: 2, 
                z: subtractedGeo.depth <= 0 ? chopped.pos.z : chopped.pos.z - ((chopped.geo.depth +  calculatedProps.geo.depth )/ 2)
            }
        }

        calculatedProps.color = {...this.state.activeColor}

        return calculatedProps;
    }

    handleGameLoss(props) {
        this.state.lost = true;
        this.ui.renderLossUi();

        this.removeMesh(this.state.activeBlock);

        props.color = this.state.activeColor;
        props.pos.y = 30;
        new Block(this, props).addRemainder();
    }

    removeMesh(mesh) {
        mesh.material.dispose();
        mesh.geometry.dispose();
        this.group.remove(mesh);
        this.scene.remove(mesh);
    }

    remove() {
        let self = this;

        return new Promise((resolve, reject) => {

            let group = self.group;
            let groupLength = self.group.children.length;

            function removeBlock() {
                self.removeMesh(group.children[group.children.length - 1]);
            }

            function removeScene() {
                self.ui.transOut().then(response => {
                    self.scene.dispose();
                    self.$parentNode.removeChild(self.$domNode);
                    resolve(response);
                });
            }

            self.group.children.slice().reverse().forEach((child, i) => {   
                TweenMax.to(child.scale, 0.3, {x: 0.001, z: 0.001, delay: Math.log10(i), onComplete:removeBlock});
            });

            TweenMax.to(self.group.position, Math.log10(groupLength) , {y:0, ease: Expo.easeIn, onComplete: removeScene});
        });
    }

    ScreenShake() {
        return {
    
            // When a function outside ScreenShake handle the camera, it should
            // always check that ScreenShake.enabled is false before.
            enabled: false,
    
            _timestampStart: undefined,
    
            _timestampEnd: undefined,
    
            _startPoint: undefined,
    
            _endPoint: undefined,
    
    
    
            // update(camera) must be called in the loop function of the renderer,
            // it will re-position the camera according to the requested shaking.
            update: function update(camera) {
                if ( this.enabled == true ) {
                    const now = Date.now();
                    if ( this._timestampEnd > now ) {
                        let interval = (Date.now() - this._timestampStart) / 
                            (this._timestampEnd - this._timestampStart) ;
                        this.computePosition( camera, interval );
                    } else {
                        camera.position.copy(this._startPoint);
                        this.enabled = false;
                    };
                };
            },
    
    
    
            // This initialize the values of the shaking.
            // vecToAdd param is the offset of the camera position at the climax of its wave.
            shake: function shake(camera, vecToAdd, milliseconds) {
                this.enabled = true ;
                this._timestampStart = Date.now();
                this._timestampEnd = this._timestampStart + milliseconds;
                this._startPoint = new THREE.Vector3().copy(camera.position);
                this._endPoint = new THREE.Vector3().addVectors( camera.position, vecToAdd );
            },
    
    
    
    
            computePosition: function computePosition(camera, interval) {
    
                // This creates the wavy movement of the camera along the interval.
                // The first bloc call this.getQuadra() with a positive indice between
                // 0 and 1, then the second call it again with a negative indice between
                // 0 and -1, etc. Variable position will get the sign of the indice, and
                // get wavy.
                if (interval < 0.4) {
                    var position = this.getQuadra( interval / 0.4 );
                } else if (interval < 0.7) {
                    var position = this.getQuadra( (interval-0.4) / 0.3 ) * -0.6;
                } else if (interval < 0.9) {
                    var position = this.getQuadra( (interval-0.7) / 0.2 ) * 0.3;
                } else {
                    var position = this.getQuadra( (interval-0.9) / 0.1 ) * -0.1;
                }
                
                // Here the camera is positioned according to the wavy 'position' variable.
                camera.position.lerpVectors( this._startPoint, this._endPoint, position );
            },
    
            // This is a quadratic function that return 0 at first, then return 0.5 when t=0.5,
            // then return 0 when t=1 ;
            getQuadra: function getQuadra(t) {
                return 9.436896e-16 + (4*t) - (4*(t*t)) ;
            }
    
        };
    
    };

}

