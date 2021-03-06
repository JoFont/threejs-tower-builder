import { Game } from "./Game/Game";
import { TowerDisplay } from "./Game/TowerDisplay";
import { Ui } from "./Ui/Ui";
import { html, render } from 'lit-html';

let windowProps = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: window.pixelRatio,
}

let loggedUser = {};

// FIXME: UPGRADE USERS MERGE CONFICTS(https://github.com/firebase/firebaseui-web#upgrading-anonymous-users)

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
					<div class="row justify-content-center">
						<button type="button" class="btn btn-warning m-2 btn-sm sign-out-btn">
							Sign Out
						</button>
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
		autoUpgradeAnonymousUsers: true,
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

			let towerDisplay = new TowerDisplay("display", windowProps);
			towerDisplay.stage();

			let requestAni;

			const startGame = game => {
				game.stage();
			
				window.addEventListener("resize",() => {
					game.updateSize();
				}, false);
				
				// Game loop
				function loop() {
					requestAni = requestAnimationFrame(loop);
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

				requestAni = requestAnimationFrame(loop);

				document.addEventListener('keydown', e =>  {
					if(e.keyCode === 32 && !game.state.lost) {
						game.placeBlock();
					} else if (e.keyCode === 82 && !game.state.lost) {
						// FIXME: Throwing weird error
						// game.remove().then(response => {
						// 	cancelAnimationFrame(requestAni);
						// 	newGame = new Game("single-player", windowProps, loggedUser);
						// 	startGame(newGame);
						// });
					}
				});
			}


			
			// Firebase Functions
			const addToLeaderboard = firebase.functions().httpsCallable("addToLeaderboard");

			
			// LIT HTML FUNCTIONS
			const loadLeaderboard = players => html `
				<div class="row">
					<h1 class="display-4 mx-auto">Three js - Tower Builder</h1>
				</div>
				<div class="row">
					<h3 class="mx-auto">by Diogo Marques</h3>
				</div>
				<div class="row mt-5">
					<h4 class="mx-auto">Global Leaderboard</h4>
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
								<div class="col-2">${player.highScore}</div>
							</div>
						`)}
					</div>
				</div>
				<div class="row justify-content-center mt-5">
					<button id="replay-from-leaderboard" type="button" class="btn btn-success btn-lg px-5">Play Again</button>
				</div>
				<div class="row justify-content-center mt-3">
					<button id="back-to-home-btn-lead" type="button" class="btn btn-dark m-2 btn-sm">
						<i class="fas fa-arrow-left mr-2"></i>
						Back
					</button>
				</div>
			`;


			db.collection("players").where("highScore", ">", 0).orderBy("highScore", "desc").limit(20).onSnapshot(query => {
				let playerList = [];

				query.forEach(doc => {
					playerList.push(doc.data());
				});

				render(loadLeaderboard(playerList), document.getElementById("leaderboards"));
			});

			document.addEventListener("click", e => {
				if(e.target.id === "main-menu-start-button") {
					Ui.switchView("home-screen", "select-game-screen");
				} else if(e.target.id === "back-to-home-btn") {
					Ui.switchView("select-game-screen", "home-screen");
					
				} else if(e.target.id === "back-to-home-btn-lead") {
					Ui.switchView("leaderboards", "home-screen");
				} else if(e.target.id === "replay-from-leaderboard") {
					Ui.hideUI("leaderboards");
					
					towerDisplay.remove().then(r => {
						startGame(newGame);
					});
				} else if(e.target.id === "leaderboards-from-game") {
					towerDisplay = new TowerDisplay("display", windowProps);
					towerDisplay.stage();
					
					newGame.remove().then(response => {
						cancelAnimationFrame(requestAni);
						newGame = new Game("single-player", windowProps, loggedUser);
						Ui.showUI("leaderboards");
					});
				} else if(e.target.id === "start-single-player") {
					Ui.hideUI("select-game-screen");
					towerDisplay.remove().then(r => {
						startGame(newGame);
					});
				} else if(e.target.id === "game-restart") {
					newGame.remove().then(response => {
						cancelAnimationFrame(requestAni);
						newGame = new Game("single-player", windowProps, loggedUser);
						startGame(newGame);
					});
				} else if(e.target.id === "user-score-post") {
					e.target.classList.add("disabled");
					e.target.innerHtml = `
						<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
						Loading...
					`;

					let input = document.getElementById("change-score-name");
					input.classList.add("disabled");
					let userName = input.value;

					addToLeaderboard({score: newGame.state.score, tower: newGame.state.tower, name: userName, date: Date.now()}).then(result => {
						e.target.innerText = "Success";

						towerDisplay = new TowerDisplay("display", windowProps);
						towerDisplay.stage();
						newGame.remove().then(response => {
							cancelAnimationFrame(requestAni);
							newGame = new Game("single-player", windowProps, loggedUser);
							Ui.showUI("leaderboards");
						});
						
					});
				} else if(e.target.classList.contains("sign-out-btn")){
					auth.signOut();
					location.reload();
				} else if(e.target.id === "main-screen-leaderboards") {
					Ui.switchView("home-screen", "leaderboards");
				}
			});

		} else {
			let ui = new firebaseui.auth.AuthUI(firebase.auth());
			// The start method will wait until the DOM is loaded.
			ui.start('#auth-game-controls', uiConfig);
		}
	});
});






