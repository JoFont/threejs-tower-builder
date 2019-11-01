import { Game } from "./Game";


let windowProps = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: window.pixelRatio,
}

const testGame = new Game("single", windowProps);
testGame.stage();
// testGame.start();

document.addEventListener('keydown', e =>  {
    if(e.keyCode === 32) {
		testGame.placeBlock();
		
    }
});


function loop() {
	requestAnimationFrame(loop);

	// console.log(testGame.blockState);

	if (testGame.blockState === "ACTIVE") {	
		// Move Block
		let speed = 0.1;

		if (testGame.workingPlane.forward === true && testGame.activeBlock.position[testGame.workingPlane.axis] + speed < testGame.workingPlane.length) {
			testGame.activeBlock.position[testGame.workingPlane.axis] += speed;
		} else if (testGame.workingPlane.forward === false && testGame.activeBlock.position[testGame.workingPlane.axis] + speed > - testGame.workingPlane.length) {
			testGame.activeBlock.position[testGame.workingPlane.axis] -= speed;
		} else {
			testGame.workingPlane.forward = !testGame.workingPlane.forward;
		}
	}

	testGame.start();
}

loop();