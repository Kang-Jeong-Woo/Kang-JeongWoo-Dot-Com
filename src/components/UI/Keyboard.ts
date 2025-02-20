export default class Keyboard {
    keyMap: { [key: string]: boolean } = {}

    constructor() {
        document.addEventListener('keydown', this.onDocumentKey)
        document.addEventListener('keyup', this.onDocumentKey)
    }

    onDocumentKey = (e: KeyboardEvent) => {
        this.keyMap[e.code] = e.type === 'keydown'
    }
}