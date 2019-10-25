import * as THREE from "three";

let scene, camera, renderer, cube, cube2, cube3;

init();
animate();

function init() {
	// Scene
	scene = new THREE.Scene();

	// Rendereer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Camera
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	camera.position.set(0, 20, 30);
	camera.rotation.x = -0.5;
	scene.add(camera);

	// light
	let light = new THREE.PointLight(0xffffff, 1);
	camera.add(light);

	// Display Axes
	let axesHelper = new THREE.AxesHelper(100);
	scene.add(axesHelper);

	// Cubes
	let geometry = new THREE.BoxGeometry(20, 2, 20);
	let material1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	cube = new THREE.Mesh(geometry, material1);
    // cube.rotation.y = 0.8;
    
    scene.add(cube);

    // Cube 2
    let material2= new THREE.MeshBasicMaterial({ color: 0x0000FF });
    cube2 = new THREE.Mesh(geometry, material2);
    cube2.position.y = cube.scale.y * 2;
    cube2.position.x = 3;
	// cube2.rotation.y = 0.8;

    scene.add(cube2);
    
    let cube2SizeX = cube2.geometry.vertices[0].x;
    let cube2SizeZ = cube2.geometry.vertices[0].z;

    let testV = {
        x: cube2.position.x - cube.position.x,
        y: cube2.position.y - cube.position.y,
        z: cube2.position.z - cube.position.z
    };

    console.log(cube2.geometry.vertices);

    let geometryResult = new THREE.BoxGeometry(testV.x, 2, cube2SizeZ * 2);
	let material3 = new THREE.MeshBasicMaterial({ color: "rgb(235, 64, 52)" });
	cube3 = new THREE.Mesh(geometryResult, material3);
    cube3.position.y = 7;
    cube3.position.x = (cube2.position.x + cube2SizeX) - cube3.geometry.vertices[0].x;

    scene.add(cube3);
    
	window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);

	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;

	renderer.render(scene, camera);
}
