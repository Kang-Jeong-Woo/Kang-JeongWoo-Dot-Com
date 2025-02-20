import {GLTF} from "three/examples/jsm/loaders/GLTFLoader.js";

export default interface ILoadingState {
    loaded: boolean;
    progress?: number;
    error?: boolean;
    model?: GLTF;
    errorMessage?: string;
}