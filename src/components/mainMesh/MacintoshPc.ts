import {Mesh, Object3D, Scene, Vector3} from "three";
import {ColliderDesc, RigidBody, RigidBodyDesc, World} from "@dimforge/rapier3d-compat";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader.js";

export default class MacintoshPc {
    position: Vector3;
    mesh!: Mesh;
    rigidBody!: RigidBody;

    constructor(position: Vector3) {
        this.position = position;
    }

    async init(scene: Scene, world: World) {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync('3dModel/macintosh/macintosh.mtl');
        materials.preload();
        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync('3dModel/macintosh/macintosh.obj');
        scene.add(object);

        const objectMesh = object.getObjectByName("Object_9") as Mesh;

        const scale = 0.3;
        const rotationY = Math.PI * 45 / 180;

        objectMesh.traverse((child:Object3D)=>{
            if (child instanceof Mesh) {
                child.position.copy(this.position);
                child.scale.set(scale, scale, scale);
                child.rotation.y = rotationY;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        })

        const createdRigidBody = world.createRigidBody(
            RigidBodyDesc.dynamic()
                .setTranslation(this.position.x, this.position.y, this.position.z)
                .setCanSleep(false)
                .setLinearDamping(1)
                .setAngularDamping(1)
                .setGravityScale(1)
        );

        const thoughtFaceShape = ColliderDesc.cuboid(0.1, 0.1, 0.1)
            .setTranslation(-0.15, 0.08, 0)
            .setMass(1)
            .setRestitution(0)
            .setFriction(5)
            .setSensor(false);

        this.mesh = objectMesh;
        this.rigidBody = createdRigidBody;
        this.rigidBody.userData = this.mesh;
        scene.add(this.mesh)
        world.createCollider(thoughtFaceShape, createdRigidBody);
    }

    update() {
        if (this.mesh && this.rigidBody) {
            this.mesh.position.copy(this.rigidBody.translation());
            this.mesh.quaternion.copy(this.rigidBody.rotation());
        }
    }
}