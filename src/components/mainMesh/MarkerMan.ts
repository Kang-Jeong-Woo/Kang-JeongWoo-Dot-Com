import {AnimationAction, AnimationMixer, Group, Mesh, Vector3} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader.js";

export default class MyMarkerMan extends Group {
    mixer?: AnimationMixer;
    glTFLoader: GLTFLoader;

    constructor(position: Vector3) {
        super()

        this.position.copy(position)
        this.scale.set(0.4, 0.4, 0.4);

        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('jsm/libs/draco/')

        this.glTFLoader = new GLTFLoader()
        this.glTFLoader.setDRACOLoader(dracoLoader)
    }

    async init(animationActions: { [key: string]: AnimationAction }) {
        const [markerMan] = await Promise.all([
            this.glTFLoader.loadAsync('3dModel/character/markerman$@danceIdle.glb'),
        ])

        markerMan.scene.traverse((m) => {
            if ((m as Mesh).isMesh) {
                m.castShadow = true
            }
        })

        this.mixer = new AnimationMixer(markerMan.scene)
        animationActions['idle'] = this.mixer.clipAction(markerMan.animations[0])
        animationActions['idle'].play()

        this.add(markerMan.scene)
    }

    update(delta: number) {
        this.mixer?.update(delta)
    }
};