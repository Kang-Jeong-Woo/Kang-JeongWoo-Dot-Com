import {
    BoxGeometry,
    Mesh,
    MeshStandardMaterial,
    RepeatWrapping,
    Scene,
    SRGBColorSpace,
    TextureLoader,
    Vector3
} from "three";
import {ColliderDesc, RigidBodyDesc, World} from "@dimforge/rapier3d-compat";

export default class Floor {
    geometry:{width:number, height:number, depth:number}

    constructor(position: {width:number, height:number, depth:number}) {
        this.geometry = position;
    }

    async init(scene: Scene, world: World, position: Vector3) {
        const textureLoader = new TextureLoader();

        const textureArm = await textureLoader.loadAsync("textures/plate/oak_veneer_01_arm_1k.jpg");
        const textureDiff = await textureLoader.loadAsync("textures/plate/oak_veneer_01_diff_1k.jpg")
        textureDiff.colorSpace = SRGBColorSpace;
        const textureDisp = await textureLoader.loadAsync("textures/plate/oak_veneer_01_disp_1k.jpg")
        const textureGl = await textureLoader.loadAsync("textures/plate/oak_veneer_01_nor_gl_1k.jpg")

        textureArm.repeat.set(2, 2);
        textureDiff.repeat.set(2, 2);
        textureDisp.repeat.set(2, 2);
        textureGl.repeat.set(2, 2);

        textureArm.wrapS = RepeatWrapping;
        textureDiff.wrapS = RepeatWrapping;
        textureDisp.wrapS = RepeatWrapping;
        textureGl.wrapS = RepeatWrapping;
        textureArm.wrapT = RepeatWrapping;
        textureDiff.wrapT = RepeatWrapping;
        textureDisp.wrapT = RepeatWrapping;
        textureGl.wrapT = RepeatWrapping;

        // const floorMaterial = new MeshStandardMaterial({
        //     map: textureDiff,
        //     aoMap: textureArm,
        //     roughnessMap: textureArm,
        //     metalnessMap: textureArm,
        //     normalMap: textureGl,
        //     displacementMap: textureDisp,
        //     polygonOffset: true,
        //     polygonOffsetFactor: -1,
        //     polygonOffsetUnits: -4,
        // })

        const material = new MeshStandardMaterial({
            color: "#000000",
        })

        const background = new Mesh(new BoxGeometry(this.geometry.width, this.geometry.height, this.geometry.depth), material);
        background.position.copy(position);
        background.receiveShadow = true;
        scene.add(background);

        const backgroundBody = world.createRigidBody(RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z));
        const backgroundShape = ColliderDesc.cuboid(this.geometry.width / 2, this.geometry.height / 2, this.geometry.depth / 2);
        world.createCollider(backgroundShape, backgroundBody);
    }
}