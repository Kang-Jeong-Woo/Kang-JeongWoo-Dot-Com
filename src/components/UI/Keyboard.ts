import { WebGLRenderer } from 'three/src/Three.js'

export default class Keyboard {
    keyMap: { [key: string]: boolean } = {}

    constructor(renderer: WebGLRenderer) {
        document.addEventListener('keydown', this.onDocumentKey)
        document.addEventListener('keyup', this.onDocumentKey)
    }

    onDocumentKey = (e: KeyboardEvent) => {
        this.keyMap[e.code] = e.type === 'keydown'
    }
}