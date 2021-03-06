import { TweenMax, Expo, CSSPlugin } from "gsap/all";
import { html, render } from 'lit-html';

export class Ui {
    constructor(container, parent) {
        this.$container = document.createElement("div");
        this.$container.setAttribute("id", container);

        this.$parent = document.getElementById(parent);
    }

    render() {
        this.$parent.appendChild(this.$container);
    }

    static switchView(hide, show) {
        document.getElementById(hide).style.display = "none";
        document.getElementById(show).style.display = "block";
    }

    static hideUI(ui) {
        document.getElementById(ui).style.display = "none";
    }

    static showUI(ui) {
        document.getElementById(ui).style.display = "block";
    }
}