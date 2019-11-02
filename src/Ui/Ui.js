

export class Ui {
    constructor(container, parent) {
        this.$container = document.createElement("div");
        this.$container.setAttribute("id", container);

        this.$parent = document.getElementById(parent);
        this.$parent.appendChild(this.$container);
    }

    changeView(content) {
        this.$container.innerHTML = content;
    }
}