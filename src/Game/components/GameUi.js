import { Ui } from "../../Ui/Ui";
import { TweenMax, CSSPlugin, AttrPlugin } from "gsap/all";
const plugins = [CSSPlugin, AttrPlugin];


export class GameUi extends Ui {
    constructor(container, parent, game) {
        super(container, parent);
        this.game = game;

        this.$container.setAttribute("style", `width: ${this.game.props.windowWidth}px;`);
        this.$container.classList.add("container-fluid", "flex-column", "w-100", "mt-5", container) 
        
        this.$score;
    }

    renderScore() {
        this.$score = document.createElement("div");
        this.$score.setAttribute("id", "game-score");
        this.$score.setAttribute("class", "row");
        // this.$score.setAttribute("class", "game-ui");
        
        this.updateUiScore(0);

        this.$container.appendChild(this.$score);
    }

    updateUiScore(value) {
        this.$score.innerHTML= `<h1 class="display-2 mx-auto">${value}</h1>`;
    }

    renderLossUi() {
        let user = this.game.user;


        this.$score.style.transition = "all 0.3s";
        this.$score.style.transform = "scale(1.3)";

        let lossUI = document.createElement("div");
        lossUI.setAttribute("id", "game-lost");
        lossUI.classList.add("container", "d-flex", "flex-column", "justify-content-center");

        let self = this;
        firebase.firestore().doc(`players/${user.uid}`).get().then(doc => {
            let highScore = doc.data().highScore;
            let userName = doc.data().name;

            if(self.game.state.score > highScore) {
                lossUI.innerHTML = `
                    <div class="container">
                        <div class="row">
                            <h3 class="mx-auto">You lost</h3>
                        </div>
                        <div class="row">
                            <h5 class="mx-auto">You beat your last highest score of <strong>${highScore}</strong>!</h5>
                        </div>
                        <div class="row mt-3">
                            <p class="mx-auto">Send your new score to the Leaderboards</p>
                        </div>
                        <div class="row justify-content-center">
                            <form class="form-inline">
                                <div class="form-group mx-sm-3 mb-2">
                                    
                                    <input type="text" class="form-control" id="change-score-name" placeholder="Name" value="${userName}">
                                </div>
                                <button type="button" class="btn btn-success mb-2">Send</button>
                            </form>
                        </div>
                        <div class="row justify-content-center mt-2">
                            <button id="game-restart" type="button" class="btn btn-danger mx-2">Restart</button>
                        </div>
                    </div>
                `;
            } else {
                lossUI.innerHTML = `
                    <div class="container">
                        <div class="row">
                            <h3 class="mx-auto">You lost</h3>
                        </div>
                        <div class="row">
                            <p class="mx-auto">Please choose one of the options below</p>
                        </div>
                        <div class="row justify-content-center">
                            <button id="game-restart" type="button" class="btn btn-success mx-2">Restart</button>
                            <button id="leaderboards-from-game" type="button" class="btn btn-primary mx-2">Leaderboards</button>
                        </div>
                    </div>
                `;
            }
        });



        this.$container.appendChild(lossUI);
    }

    renderUpdateScore() {

        // this.$score.style.transition = "all 0.3s";
        // this.$score.style.transform = "scale(1.3)";

        let updateScoreUi = document.createElement("div");
        updateScoreUi.setAttribute("id", "game-lost");
        updateScoreUi.classList.add("container", "d-flex", "flex-column", "justify-content-center");

        updateScoreUi.innerHTML = `
            <div class="container">
                <div class="row justify-content-center">
                    
                </div>
            </div>
        `;

        this.$container.removeChild(document.getElementById("game-lost"));
        this.$container.appendChild(updateScoreUi);
    }

    transOut() {
        let children = this.$container.childNodes

        return new Promise((resolve, reject) => {
            let duration; 
            children.forEach((node, i) => {
                duration = i * 400;
    
                node.style.transition = `all ${duration}ms`;
                node.style.transform = "translateY(-500px)";
            });

            setTimeout(() => {
                resolve(duration);
            }, duration)
        });
    }
}