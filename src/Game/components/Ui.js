

export class Ui {
    constructor(game) {
        this.game = game;
    }

    updateScore() {
        let $score = document.getElementById("score");
        $score.textContent = this.game.score;
    }
}