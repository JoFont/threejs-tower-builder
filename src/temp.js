import * as THREE from "three";


const Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};




// Scene
let scene = new THREE.Scene();

// Rendereer
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor('#D0CBC7', 1);
document.body.appendChild(renderer.domElement);

// Camera
let aspectRatio = window.innerWidth / window.innerHeight;
let d = 20;
let camera = new THREE.OrthographicCamera(-d * aspectRatio, d * aspectRatio, d, -d, -100, 1000);
camera.position.x = 2;
camera.position.y = 2;
camera.position.z = 2;
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera); 

// light
let light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(0, 499, 0);
scene.add(light);
	
let softLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(softLight);

// Display Axes
let axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// A group of Blocks
let blockGroup = new THREE.Group();

let currentBlock = {};

let workingPlane = {
	length: 20,
	axis: "z",
	forward: true
}

let blockState = "ACTIVE";


const newBlock = () => {
	// References the last block in the group of blocks
	let prevBlock = blockGroup.children[blockGroup.children.length - 1];
	let blockGeo = {
		x: prevBlock.geometry.parameters.width,
		y: prevBlock.geometry.parameters.height,
		z: prevBlock.geometry.parameters.depth,
	};

	// Gets position based on the position of the last element in the Group of blocks
	let blockPos = {
		x: workingPlane.axis === "z" ? prevBlock.position.x - workingPlane.length : prevBlock.position.x,
		y: prevBlock.position.y + blockGeo.y,
		z: workingPlane.axis === "x" ? prevBlock.position.z - workingPlane.length : prevBlock.position.z
	}

	let geometry = new THREE.BoxGeometry(blockGeo.x, blockGeo.y, blockGeo.z);
	let material = new THREE.MeshToonMaterial({ color: Colors.brown, shading: THREE.FlatShading });

	let block = new THREE.Mesh(geometry, material);
	block.position.set(blockPos.x, blockPos.y, blockPos.z);

	// Renders the new block
	blockGroup.add(block);
	currentBlock = blockGroup.children[blockGroup.children.length - 1];
	blockGroup.position.y -= 2;
	console.log(currentBlock);
	workingPlane.axis === "x" ? workingPlane.axis = "z" : workingPlane.axis = "x";
	blockState = "ACTIVE";

	
}

const placeBlock = () => {
	let lastBlockRef = blockGroup.children[blockGroup.children.length - 2];

	let lastBlockProps = {
		width: lastBlockRef.geometry.parameters.width,
		height: lastBlockRef.geometry.parameters.height,
		depth: lastBlockRef.geometry.parameters.depth,
		x: lastBlockRef.position.x,
		y: lastBlockRef.position.y,
		z: lastBlockRef.position.z
	};

	let currentBlockProps = {
		width: currentBlock.geometry.parameters.width,
		height: currentBlock.geometry.parameters.height,
		depth: currentBlock.geometry.parameters.depth,
		x: currentBlock.position.x,
		y: currentBlock.position.y,
		z: currentBlock.position.z
	}


	let blockGeo = {};

	// Gets position based on the position of the last element in the Group of blocks

	let blockPos = {};

	if (workingPlane.axis === "x" && currentBlockProps.x - lastBlockProps.x > 0 || workingPlane.axis === "z" && currentBlockProps.z - lastBlockProps.z > 0) {
		blockGeo = {
			x: lastBlockProps.width - currentBlockProps.x + lastBlockProps.x,
			y: lastBlockProps.height,
			z: lastBlockProps.depth - currentBlockProps.z + lastBlockProps.z,
		};

		blockPos = {
			x: currentBlockProps.x - ((currentBlockProps.width - blockGeo.x) / 2),
			y: currentBlockProps.y,
			z: currentBlockProps.z - ((currentBlockProps.depth - blockGeo.z) / 2)
		}
	} else {
		blockGeo = {
			x: lastBlockProps.width + currentBlockProps.x - lastBlockProps.x,
			y: lastBlockProps.height,
			z: lastBlockProps.depth + currentBlockProps.z - lastBlockProps.z,
		};

		blockPos = {
			x: currentBlockProps.x + ((currentBlockProps.width - blockGeo.x) / 2),
			y: currentBlockProps.y,
			z: currentBlockProps.z + ((currentBlockProps.depth - blockGeo.z) / 2),
		}
	}

	// TODO: Its Commented out but loss detection works
	// if(blockPos.x - blockGeo.x > lastBlockProps.width) {
	// 	alert("YOU LOST SUCKER");
	// }

	let geometry = new THREE.BoxGeometry(blockGeo.x, blockGeo.y, blockGeo.z);
	let material = new THREE.MeshToonMaterial({ color: Colors.pink, shading: THREE.FlatShading});


	let block = new THREE.Mesh(geometry, material);
	block.position.set(blockPos.x, blockPos.y, blockPos.z);

	// Renders the new block
	blockGroup.remove(currentBlock);
	scene.remove(currentBlock);
	blockGroup.add(block);

	newBlock();
}

// Cubes
let geometry = new THREE.BoxGeometry(10, 2, 10);
let material1 = new THREE.MeshToonMaterial({ color: 0x00ff00, shading: THREE.FlatShading });
let cube = new THREE.Mesh(geometry, material1);

scene.add(cube);

// Cube 2
let material2 = new THREE.MeshToonMaterial({ color: 0x0000FF, shading: THREE.FlatShading });
let cube2 = new THREE.Mesh(geometry, material2);

cube2.position.y = cube.scale.y * 2;
cube2.position.x = 3;

scene.add(cube2);

let cube3Size = {
	x: cube2.geometry.parameters.depth - cube2.position.x,
	y: cube2.geometry.parameters.height,
	z: cube2.geometry.parameters.width - cube2.position.z,
}

let cube3Pos = {
	x: cube2.position.x / 2,
	y: cube2.position.y + 2,
	z: cube2.position.z / 2
}

console.log(cube2.geometry.parameters);

let geometryResult = new THREE.BoxGeometry(cube3Size.x, cube3Size.y, cube3Size.z);
let material3 = new THREE.MeshToonMaterial({ color: "rgb(235, 64, 52)", shading: THREE.FlatShading });
let cube3 = new THREE.Mesh(geometryResult, material3);
// cube3.position.y = 4;
// cube3.position.x = (cube2.position.x + cube2SizeX) - cube3.geometry.vertices[0].x;
cube3.position.x = cube3Pos.x;
cube3.position.y = cube3Pos.y;
cube3.position.z = cube3Pos.z;

// scene.add(cube3);

blockGroup.add(cube);
blockGroup.add(cube2);
blockGroup.add(cube3);

scene.add(blockGroup);

newBlock();


console.log(blockGroup.children);






window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
	let viewSize = 30;
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.left = window.innerWidth / -viewSize;
	camera.right = window.innerWidth / viewSize;
	camera.top = window.innerHeight / viewSize;
	camera.bottom = window.innerHeight / -viewSize;
	camera.updateProjectionMatrix();
}

document.addEventListener('keydown', e =>  {
    if(e.keyCode === 32) {
		blockState = "PLACE";
		placeBlock();
    }
});



function gameLoop() {
	requestAnimationFrame(gameLoop);

	if (blockState === "ACTIVE") {	
		// Move Block
		let speed = 0.1;

		if (workingPlane.forward === true && currentBlock.position[workingPlane.axis] + speed < workingPlane.length) {
			currentBlock.position[workingPlane.axis] += speed;
		} else if (workingPlane.forward === false && currentBlock.position[workingPlane.axis] + speed > - workingPlane.length) {
			currentBlock.position[workingPlane.axis] -= speed;
		} else {
			workingPlane.forward = !workingPlane.forward;
		}
	}
	// console.log(currentBlock.position.z, workingPlane.dir);
	

	// console.log(currentBlock.position)
	
	renderer.render(scene, camera);
}

gameLoop();
