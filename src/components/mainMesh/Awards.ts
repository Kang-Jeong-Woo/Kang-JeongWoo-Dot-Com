import {Euler, Mesh, Object3D, Quaternion, Scene, Vector3} from "three";
import {ColliderDesc, RigidBody, RigidBodyDesc, World} from "@dimforge/rapier3d-compat";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

export default class Awards {
    position: Vector3;
    meshes: Mesh[] = [];
    rigidBodies: RigidBody[] = [];
    objectNames: string[] = ["one", "two", "three"];

    constructor(position: Vector3) {
        this.position = position;
    }

    async init(scene: Scene, world: World) {
        const rotationY = Math.PI * 90 / 180;

        const gltfLoader = new GLTFLoader();
        const gltf = await gltfLoader.loadAsync("3dModel/awards/awards.gltf");
        const model = gltf.scene;

        const cubeMeshes = this.objectNames
            .map(name => model.getObjectByName(name) as Mesh | undefined)
            .filter((mesh): mesh is Mesh => mesh !== undefined);

        let i = 0;
        for (const objectMesh of cubeMeshes) {
            objectMesh.castShadow = true;
            objectMesh.traverse((child: Object3D) => {
                if (child instanceof Mesh) {
                    child.position.copy(this.position);
                    child.receiveShadow = true;
                    child.castShadow = true;
                }
            });

            const createdRigidBody = world.createRigidBody(
                RigidBodyDesc.dynamic()
                    .setTranslation(this.position.x + i * 0.5, this.position.y, this.position.z)
                    .setCanSleep(false)
                    .setLinearDamping(1)
                    .setAngularDamping(1)
                    .setGravityScale(1)
            );

            const createdRigidBodyShape = ColliderDesc.cylinder(0.2, 0.1)
                .setTranslation(0, 0, -0.15)
                .setRotation(new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0)))
                .setMass(1)
                .setRestitution(0)
                .setFriction(0)
                .setSensor(false);

            createdRigidBody.userData = objectMesh;
            const quaternion = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), rotationY);
            createdRigidBody.setRotation(quaternion, true);

            scene.add(objectMesh);
            world.createCollider(createdRigidBodyShape, createdRigidBody);

            this.meshes.push(objectMesh);
            this.rigidBodies.push(createdRigidBody);
            i++;
        }
    }

    update() {
        for (let i = 0; i < this.meshes.length; i++) {
            if (this.meshes[i] && this.rigidBodies[i]) {
                const translation = this.rigidBodies[i].translation();
                const rotation = this.rigidBodies[i].rotation();

                if (translation && rotation) {
                    this.meshes[i].position.copy(translation as Vector3);
                    this.meshes[i].quaternion.copy(rotation as Quaternion);
                }
            }
        }
    }

    dispose(scene: Scene, world: World) {
        this.meshes.forEach(mesh => {
            if (mesh) {
                scene.remove(mesh);
            }
        });
        this.rigidBodies.forEach(body => {
            if (body) {
                world.removeRigidBody(body);
            }
        });
        this.meshes = [];
        this.rigidBodies = [];
    }
}