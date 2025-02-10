import {DirectionalLight, Scene} from "three";

export default class FollowLights {
    private directionalLight = new DirectionalLight("#ffffff", 3);

    constructor(scene:Scene) {
        this.directionalLight.position.set(1, 1, 0);
        scene.add(this.directionalLight);
    }
}