import { Game } from "./Game/Game";
import { Ui } from "./Ui/Ui";

let windowProps = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: window.pixelRatio,
}

/*
	TODO: Rethink the whole ui thing. Ui maybe should be global.
*/




const startGame = type => {
	const game = new Game(type, windowProps);
	game.stage();

	window.addEventListener("resize",() => {
		game.updateSize();
	}, false);

	document.addEventListener('keydown', e =>  {
		if(e.keyCode === 32 && !game.state.lost) {
			game.placeBlock();
		}
	});

	function loop() {
		requestAnimationFrame(loop);
		if (game.state.blockState === "ACTIVE") {	
			// Move Block
			let speed = game.state.speed;
	
			if (game.state.plane.forward === true && game.state.activeBlock.position[game.state.plane.axis] + speed < game.state.plane.length) {
				game.state.activeBlock.position[game.state.plane.axis] += speed;
			} else if (game.state.plane.forward === false && game.state.activeBlock.position[game.state.plane.axis] + speed > - game.state.plane.length) {
				game.state.activeBlock.position[game.state.plane.axis] -= speed;
			} else {
				game.state.plane.forward = !game.state.plane.forward;
			}
		}
	
		game.render();
	}
	loop();
}



let mode = "";

if(mode !== "dev") {
	document.addEventListener("click", e => {
		if(e.target.id === "main-menu-start-button") {
			Ui.switchView("home-screen", "select-game-screen");
		} else if(e.target.id === "back-to-home-btn") {
			Ui.switchView("select-game-screen", "home-screen");
		} else if(e.target.id === "start-single-player") {
			Ui.hideUI("select-game-screen");
			startGame("single-player");
		} else if(e.target.id === "game-restart") {
			startGame("single-player");
		}
	});
} else {
	Ui.hideUI("ui");
	startGame("single-player");
}


// document.addEventListener('DOMContentLoaded', function() {
// 	// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
// 	// // The Firebase SDK is initialized and available here!
// 	//
// 	// firebase.auth().onAuthStateChanged(user => { });
// 	// firebase.database().ref('/path/to/ref').on('value', snapshot => { });
// 	// firebase.messaging().requestPermission().then(() => { });
// 	// firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
// 	//
// 	// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

// 	try {
// 	  let app = firebase.app();
// 	  let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
// 	  document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
// 	} catch (e) {
// 	  console.error(e);
// 	  document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
// 	}
//   });