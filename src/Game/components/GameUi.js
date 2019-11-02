import { Ui } from "../../Ui/Ui";

export class GameUi extends Ui {
    constructor(container, parent, game) {
        super(container, parent);
        this.game = game;
    }

    updateScore() {
        let $score = document.getElementById("score");
        $score.textContent = this.game.score;
    }

}