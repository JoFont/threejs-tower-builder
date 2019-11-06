import { Game } from "./Game/Game";
import { Ui } from "./Ui/Ui";
import { html, render } from 'lit-html';

let windowProps = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: window.pixelRatio,
}

let loggedUser = {};

document.addEventListener('DOMContentLoaded', function() {
	
	let auth = firebase.auth();
	let db = firebase.firestore();

	function handleLoggedIn(user) {
		loggedUser = {
            displayName: user.displayName,
            email: user.email,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
            isAnonymous: user.isAnonymous,
            uid: user.uid,
            providerData: user.providerData,
		};
		
		

        const mainScrenControls = html`
            <div class="row justify-content-center mt-5">
                <button id="main-menu-start-button" type="button" class="btn btn-success btn-lg px-5">Play</button>
            </div>
            <div class="row justify-content-center mt-3">
                <button type="button" id="main-screen-leaderboards" class="btn btn-primary m-2">Leaderboard</button>
            </div>
        `;

        render(mainScrenControls, document.getElementById("auth-game-controls"));
	}

	let uiConfig = {
		callbacks: {
			signInSuccessWithAuthResult: function(authResult, redirectUrl) {
				let user = authResult.user;
				let credential = authResult.credential;
				let isNewUser = authResult.additionalUserInfo.isNewUser;
				let providerId = authResult.additionalUserInfo.providerId;
				let operationType = authResult.operationType;


				document.getElementById('loader').remove();

				handleLoggedIn(user);

				const mainScrenControls = html`
					<div class="row justify-content-center mt-5">
						<button id="main-menu-start-button" type="button" class="btn btn-success btn-lg px-5">Play</button>
					</div>
					<div class="row justify-content-center mt-3">
						<button type="button" id="main-screen-leaderboards" class="btn btn-primary m-2">Leaderboard</button>
					</div>
				`;

				render(mainScrenControls, document.getElementById("auth-game-controls"));

				return false;
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
				document.getElementById('loader').remove();
			}
		},
		credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
		// Query parameter name for mode.
		queryParameterForWidgetMode: 'mode',
		// Query parameter name for sign in success url.
		queryParameterForSignInSuccessUrl: 'signInSuccessUrl',
		// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
		signInFlow: 'popup',
		signInSuccessUrl: '',
		signInOptions: [
		// Leave the lines as is for the providers you want to offer your users.
		firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		firebase.auth.FacebookAuthProvider.PROVIDER_ID,
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

	firebase.auth().onAuthStateChanged(user => {
		if (user) {
			// User is signed in.
			handleLoggedIn(user);
			
			let newGame = new Game("single-player", windowProps, user);

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
			
			// Firebase Functions
			const addToLeaderboard = firebase.functions().httpsCallable("addToLeaderboard");

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
							newGame = new Game("single-player", windowProps, loggedUser);
							startGame(newGame);
						});
					} else if(e.target.id === "main-screen-leaderboards") {
						const leaderboard = players => html `
							<div class="row mt-5">
								<h4 class="mx-auto">Leaderboard</h4>
							</div>
							<div class="container justify-content-center mt-3">
								<div class="col">
									<div class="row">
										<div class="col-2"><h6>#</h6></div>
										<div class="col-8"><h6>Name</h6></div>
										<div class="col-2"><h6>Score</h6></div>
									</div>
									${players.map((player, id) => html`
										<div class="row">
										<div class="col-2">${id + 1}.</div>
											<div class="col-8">${player.name}</div>
											<div class="col-2">${player.score}</div>
										</div>
									`)}
								</div>
							</div>
						`;
						
						//TODO: IT WERKS, Needs massive refactor everithing ion main
						let test = []
						db.collection("players").get().then(function(querySnapshot) {
							querySnapshot.forEach(function(doc) {
								// doc.data() is never undefined for query doc snapshots
								// console.log(doc.id, " => ", doc.data());
								test.push(doc.data());
							});

							render(leaderboard(test), document.getElementById("main-screen-leaderboard"));
						});
						

						
					} else if(e.target.id === "leaderboards-from-game-TESTE") {

						// newGame.ui.renderUpdateScore();

						// db.doc(`players/${loggedUser.uid}`).get().then(doc => {
						// 	let highScore = doc.data().highScore;
						// 	if(newGame.state.score > highScore) {
								
						// 	}
						// })
						
					} else if(e.target.id === "user-score-post") {
						addToLeaderboard({score: newGame.state.score, date: Date.now()}).then(result => {
							console.log(result.data);
						});
					}
				});
			} else {
				Ui.hideUI("ui");
				startGame();
			}










		} else {
			let ui = new firebaseui.auth.AuthUI(firebase.auth());
			// The start method will wait until the DOM is loaded.
			ui.start('#auth-game-controls', uiConfig);
		}
	});






	



	
	



});






