import {Euler, Mesh, Object3D, Quaternion, Scene, Vector3} from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader.js";

export default class ThoughtFace {
    position: Vector3;
    mesh!: Mesh;

    constructor(position: Vector3) {
        this.position = position;
    }

    async init(scene: Scene) {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync('3dModel/thought_face_small/thought_face.mtl');
        materials.preload();
        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync('3dModel/thought_face_small/thought_face.obj');
        scene.add(object);

        const initialRotation = new Euler(-Math.PI * 0.05, -Math.PI * 0.05, 0);
        const quaternion = new Quaternion().setFromEuler(initialRotation);

        const thoughtFaceMesh = object.getObjectByName("BaseFace.008") as Mesh;
        thoughtFaceMesh.traverse((child:Object3D)=>{
            if (child instanceof Mesh) {
                child.position.copy(this.position);
                child.receiveShadow = true;
                child.castShadow = true;
                child.setRotationFromQuaternion(quaternion);
            }
        })

        this.mesh = thoughtFaceMesh;
        scene.add(this.mesh)
    }
}