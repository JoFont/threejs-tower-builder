import * as THREE from 'three';

let scene, camera, renderer, cube;


init();
animate();


function init() {
    // Scene
    scene = new THREE.Scene();

    // Rendereer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    // Camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 15, 8, 30 );
    scene.add( camera );

    // light
    let light = new THREE.PointLight( 0xffffff, 1 );
    camera.add( light );

    // Display Axes
    let axesHelper = new THREE.AxesHelper( 100 );
    scene.add( axesHelper );
    
    // Cube
    let geometry = new THREE.BoxGeometry( 10, 10, 10 );
    let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    

    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

	renderer.render( scene, camera );
}


