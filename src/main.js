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


// FirebaseUI config.
var uiConfig = {
	callbacks: {
	  signInSuccessWithAuthResult: function(authResult, redirectUrl) {
		var user = authResult.user;
		var credential = authResult.credential;
		var isNewUser = authResult.additionalUserInfo.isNewUser;
		var providerId = authResult.additionalUserInfo.providerId;
		var operationType = authResult.operationType;
		// Do something with the returned AuthResult.
		// Return type determines whether we continue the redirect automatically
		// or whether we leave that to developer to handle.
		return true;
	  },
	  signInFailure: function(error) {
		// Some unrecoverable error occurred during sign-in.
		// Return a promise when error handling is completed and FirebaseUI
		// will reset, clearing any UI. This commonly occurs for error code
		// 'firebaseui/anonymous-upgrade-merge-conflict' when merge conflict
		// occurs. Check below for more details on this.
		return handleUIError(error);
	  },
	  uiShown: function() {
		// The widget is rendered.
		// Hide the loader.
		document.getElementById('loader').style.display = 'none';
	  }
	},
	credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
	// Query parameter name for mode.
	queryParameterForWidgetMode: 'mode',
	// Query parameter name for sign in success url.
	queryParameterForSignInSuccessUrl: 'signInSuccessUrl',
	// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
	signInFlow: 'popup',
	signInSuccessUrl: '<url-to-redirect-to-on-success>',
	signInOptions: [
	  // Leave the lines as is for the providers you want to offer your users.
	  firebase.auth.GoogleAuthProvider.PROVIDER_ID,
	  firebase.auth.FacebookAuthProvider.PROVIDER_ID,
	  {
		provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
		// Whether the display name should be displayed in the Sign Up page.
		requireDisplayName: true
	  },
	  {
		provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
		// Invisible reCAPTCHA with image challenge and bottom left badge.
		recaptchaParameters: {
		  type: 'image',
		  size: 'invisible',
		  badge: 'bottomleft'
		}
	  },
	  firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
	],
	// Set to true if you only have a single federated provider like
	// firebase.auth.GoogleAuthProvider.PROVIDER_ID and you would like to
	// immediately redirect to the provider's site instead of showing a
	// 'Sign in with Provider' button first. In order for this to take
	// effect, the signInFlow option must also be set to 'redirect'.
	immediateFederatedRedirect: false,
	// tosUrl and privacyPolicyUrl accept either url string or a callback
	// function.
	// Terms of service url/callback.
	tosUrl: '<your-tos-url>',
	// Privacy policy url/callback.
	privacyPolicyUrl: function() {
	  window.location.assign('<your-privacy-policy-url>');
	}
  };

  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  // The start method will wait until the DOM is loaded.
  ui.start('#firebaseui-auth-container', uiConfig);



// // This is a lit-html template function. It returns a lit-html template.
// const helloTemplate = (name) => html`<div id="FDB">Hello ${name}!</div>`;

// // This renders <div>Hello Steve!</div> to the document body
// render(helloTemplate('Steve'), document.body);


let newGame = new Game("single-player", windowProps);

const startGame = game => {
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
			startGame(newGame);
			
			// game.start();
		} else if(e.target.id === "game-restart") {
			newGame.remove().then(response => {
				newGame = new Game("single-player", windowProps);
				startGame(newGame);
			});
			
		}
	});
} else {
	Ui.hideUI("ui");
	startGame();
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