import * as THREE from "three";
import { DisplayBlock } from "./components/DisplayBlock";
import { Game } from "./Game";

export class TowerDisplay extends Game {
    constructor(mode, props) {
        super(mode, props);
        this.towers = [];
        this.meshTowerGroups = [];

        this.towerPositions = [];
        this.names = [];

        this.axesHelper = new THREE.AxesHelper(100);
        
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
        const density = 0.05;
        this.scene.fog = new THREE.FogExp2(color, density);


        this.getTowers().then(() => {
            self.towers.forEach(tower => {
                const group = new THREE.Group();
                
                const max = 10;
                const min = -10;

                const randomPos = Math.floor(Math.random()*(max-min+1)+min);

                tower.forEach(layer => {
                    new DisplayBlock(group, layer).add();
                });

                group.position.set(-randomPos, -85, randomPos);

                console.log(group.position);
                // console.log(self.camera.position);

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
}