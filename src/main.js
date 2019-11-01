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

	if (testGame.state.blockState === "ACTIVE") {	
		// Move Block
		let speed = 0.1;

		if (testGame.state.plane.forward === true && testGame.state.activeBlock.position[testGame.state.plane.axis] + speed < testGame.state.plane.length) {
			testGame.state.activeBlock.position[testGame.state.plane.axis] += speed;
		} else if (testGame.state.plane.forward === false && testGame.state.activeBlock.position[testGame.state.plane.axis] + speed > - testGame.state.plane.length) {
			testGame.state.activeBlock.position[testGame.state.plane.axis] -= speed;
		} else {
			testGame.state.plane.forward = !testGame.state.plane.forward;
		}
	}

	testGame.start();
}

loop();