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
        // let test = document.getElementById("game-score"); 

        TweenMax.to(".game-ui", 1, {left: 90, onComplete:log});

 
        function log() {
            console.log("Anim Comp")
        }
    }
}