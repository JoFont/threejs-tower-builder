export class Utils {
    constructor() {
    }

    static generateID() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}