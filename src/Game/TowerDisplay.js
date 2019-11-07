import * as THREE from "three";
import { TweenMax, Expo } from "gsap/all"; 
import { DisplayBlock } from "./components/DisplayBlock";
import { Game } from "./Game";

export class TowerDisplay extends Game {
    constructor(mode, props) {
        super(mode, props);
        this.towers = [];
        this.meshTowerGroups = [];

        this.avaliableSpots = [5, -5, 10, -10, 15, -15, 20, -20, 25, -25];
        this.names = [];


        this.textParent = document.getElementById("tower-display-scores");
        this.loader = new THREE.FontLoader();

        this.animationFrame;

        // this.axesHelper = new THREE.AxesHelper(100);
        
    }

    getTowers() {
        let self = this;
        let db = firebase.firestore();

        return new Promise((resolve, reject) => {
            db.collection("players").orderBy("highScore", "desc").limit(10).onSnapshot(query => {
                query.forEach(doc => {
                    if(doc.data().highestTower) {
                        self.towers.push(doc.data().highestTower);
                        self.names.push(doc.data().name);
                    }
                });
                resolve();
            }); 
        });
    }

    stage() {
        let self = this;

        this.$domNode.appendChild(this.renderer.domElement);
        
        this.scene.add(this.camera);
        this.scene.add(this.light);
        this.scene.add(this.softLight);

        const color = 0xFFFFFF;
        const density = 0.03;
        this.scene.fog = new THREE.FogExp2(color, density);


        this.getTowers().then(() => {
            self.towers.forEach((tower, i) => {
                const group = new THREE.Group();
                
                const max = 0;
                const min = -3;
                const randomDepth = Math.floor(Math.random()*(max-min+1)+min);

                tower.forEach(layer => {
                    new DisplayBlock(group, layer).add();
                });

                // console.log(group.position);
                group.position.set(-self.avaliableSpots[i] * randomDepth, -84, self.avaliableSpots[i]);

                self.meshTowerGroups.push(group);
                self.scene.add(group);
            });

            // this.scene.add(this.axesHelper);
            self.render();
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    renderText(props, pos) {
        let container = document.createElement("div");
        container.classList.add("tower-text-container");
        container.innerHTML = `
            <h5>${props.name}</h5>
            <p>${props.score}</p>
        `;

        // const tempV = new THREE.Vector3();

        // // get the position of the center of the cube
        // props.pos.updateWorldMatrix(true, false);
        // props.pos.getWorldPosition(tempV);
        
        // // get the normalized screen coordinate of that position
        // // x and y will be in the -1 to +1 range with x = -1 being
        // // on the left and y = -1 being on the bottom
        // tempV.project(camera);
        
        // // convert the normalized position to CSS coordinates
        // const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
        // const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
        
        // // move the elem to that position
        // elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
    }

    remove() {
        let self = this;

        return new Promise((resolve, reject) => {
            let counter = 0;

            function removeBlock(group) {
                group.children.forEach(mesh => {
                    mesh.geometry.dispose();
                    mesh.material.dispose();
                });

                counter++

                if(counter === self.meshTowerGroups.length) {
                    self.scene.dispose();
                    self.$parentNode.removeChild(self.$domNode);
                    resolve();
                }
            };
            
            self.meshTowerGroups.forEach((group, i) => {
                // TweenMax.to(group.position, 3, {y: -200, delay: Math.log10(i), onComplete:removeBlock, onCompleteParams:[group]});

                removeBlock(group);
            });
            
        });
        
    }
}