import {AnimationAction, AnimationMixer, Group, Material, Mesh, Scene, Vector3} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {World} from "@dimforge/rapier3d-compat";

export default class Racer {
    private model: Group | null = null;
    private mixer: AnimationMixer | null = null;
    private runAction: AnimationAction | null = null;
    private jumpAction: AnimationAction | null = null;
    private isJumping: boolean = false;
    private loader = new GLTFLoader();

    constructor(private position: Vector3) {}

    async init(scene: Scene, _: World) {
        const runningGLTF = await this.loader.loadAsync('3dModel/character/racer$@running.glb');
        this.model = runningGLTF.scene;
        this.model.scale.set(0.2, 0.2, 0.2);
        this.model.position.copy(this.position);
        this.model.rotation.y = -Math.PI / 2;
        scene.add(this.model);

        this.mixer = new AnimationMixer(this.model);
        this.runAction = this.mixer.clipAction(runningGLTF.animations[0]);
        this.runAction.play();

        const jumpGLTF = await this.loader.loadAsync('3dModel/character/$@jump.glb');
        this.jumpAction = this.mixer.clipAction(jumpGLTF.animations[0]);
    }

    async jump() {
        if (!this.model || !this.jumpAction || !this.runAction || this.isJumping) {
            return;
        }

        this.isJumping = true;

        this.runAction.fadeOut(0.1);
        this.jumpAction.reset();
        this.jumpAction.fadeIn(0.1);
        this.jumpAction.play();

        await new Promise<void>((resolve) => {
            const duration = this.jumpAction!.getClip().duration;
            setTimeout(() => {
                this.jumpAction!.fadeOut(0.1);
                this.runAction!.reset();
                this.runAction!.fadeIn(0.1);
                this.runAction!.play();
                this.isJumping = false;
                resolve();
            }, duration * 700);
        });
    }

    update(deltaTime: number) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }

    dispose() {
        this.model?.traverse((object) => {
            if (object instanceof Mesh) {
                object.geometry.dispose();
                if (object.material instanceof Material) {
                    object.material.dispose();
                } else if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                }
            }
        });

        this.mixer?.stopAllAction();
        this.model?.removeFromParent();
    }
}