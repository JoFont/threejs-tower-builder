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
        let lossUI = document.createElement("div");
        lossUI.setAttribute("id", "game-lost");
        lossUI.classList.add("container", "d-flex", "flex-column", "justify-content-center");

        lossUI.innerHTML = `
            <div id="game-lost">
                <div class="row">
                    <h3 class="mx-auto">You lost</h3>
                </div>
                <div class="row">
                    <p class="mx-auto">Please choose one of the options below</p>
                </div>
                <div class="row justify-content-center">
                    <button id="game-restart" type="button" class="btn btn-success mx-2">Restart</button>
                    <button type="button" class="btn btn-primary mx-2">Leaderboards</button>
                </div>
            </div>
        `;

        this.$container.appendChild(lossUI);
    }
}