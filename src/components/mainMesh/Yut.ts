import {Mesh, Quaternion, Scene, Vector3} from "three";
import {ColliderDesc, RigidBody, RigidBodyDesc, World} from "@dimforge/rapier3d-compat";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

export default class Yut {
    objectName: Array<string> = ["asd_1_phong4_0", "asd_2_phong5_0"];
    meshes: Array<Mesh> = [];
    rigidBodies: Array<RigidBody> = [];
    initPosition!: Vector3;

    constructor() {}

    async init(scene: Scene, world: World, position: Vector3) {
        this.initPosition = position;
        const gltfLoader = new GLTFLoader();
        const gltf = await gltfLoader.loadAsync("3dModel/yut/yut.gltf");
        const model = gltf.scene;

        const scale = 0.05;

        for(const name of this.objectName) {
            const yutMesh = model.getObjectByName(name) as Mesh;
            yutMesh.castShadow = true;
            yutMesh.receiveShadow = true;
            yutMesh.scale.set(scale, scale, scale);
            yutMesh.position.set(position.x + 0.1, position.y, position.z);
            scene.add(yutMesh);

            const yutBody = world.createRigidBody(
                RigidBodyDesc.dynamic()
                    .setTranslation(position.x, position.y, position.z)
                    .setCanSleep(true)
                    .setLinearDamping(0.5)
                    .setAngularDamping(0.3)
                    .setGravityScale(1)
            )

            const originalPoints = new Float32Array(yutMesh.geometry.attributes.position.array);
            const scaledPoints = new Float32Array(originalPoints.length);
            for (let i = 0; i < originalPoints.length; i++) {
                scaledPoints[i] = originalPoints[i] * scale;
            }
            const yutShape1 = (ColliderDesc.convexHull(scaledPoints) as ColliderDesc)
                .setMass(0.2)
                .setRestitution(0.3)
                .setFriction(0.8)

            world.createCollider(yutShape1, yutBody);

            this.meshes.push(yutMesh);
            this.rigidBodies.push(yutBody);
        }
    }

    throw() {
        for (let i = 0; i < this.objectName.length; i++) {
            const throwStrength = 1.5;
            const diagonalAngle = Math.PI / 8;
            this.rigidBodies[i].setAngvel({ x: 0, y: 0, z: 0 }, true);

            const rotX = Math.random() * Math.PI * 2;
            const rotY = Math.random() * Math.PI * 2;
            const rotZ = Math.random() * Math.PI * 2;
            const rotW = Math.random() * Math.PI * 2;

            this.rigidBodies[i].setRotation({x: rotX, y: rotY, z: rotZ, w: rotW}, true);

            const throwDirection = new Vector3(
                Math.cos(diagonalAngle) + (Math.random() - 0.5) * 0.2,
                40 + Math.random() * 5,
                Math.sin(diagonalAngle) + (Math.random() - 0.5) * 0.2
            ).normalize();

            this.rigidBodies[i].applyImpulse(
                {
                    x: throwDirection.x * throwStrength,
                    y: throwDirection.y * throwStrength,
                    z: throwDirection.z * throwStrength
                },
                true
            );

            this.rigidBodies[i].applyTorqueImpulse(
                {
                    x: Math.random() * 5,
                    y: Math.random() * 5,
                    z: Math.random() * 5
                },
                true
            );

            const baseRotationSpeed = 5;
            const angularVelocity = {
                x: (Math.random() - 0.5) * baseRotationSpeed,
                y: (Math.random() - 0.5) * baseRotationSpeed,
                z: (Math.random() - 0.5) * baseRotationSpeed
            };

            this.rigidBodies[i].setAngvel(angularVelocity, true);
        }
    }

    update() {
        for (let i = 0; i < this.objectName.length; i++) {
            this.meshes[i].position.copy(this.rigidBodies[i].translation());
            this.meshes[i].quaternion.copy(this.rigidBodies[i].rotation());
        }
    }

    resetPosition() {
        for (let i = 0; i < this.objectName.length; i++) {
            this.rigidBodies[i].setTranslation({ x: this.initPosition.x, y: this.initPosition.y, z: this.initPosition.z }, false);
            this.rigidBodies[i].setRotation(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI * 90 / 180), false);
            this.rigidBodies[i].setLinvel({ x: 0, y: 0, z: 0 }, false);
            this.rigidBodies[i].setAngvel({ x: 0, y: 0, z: 0 }, false);
            this.rigidBodies[i].sleep();
        }
    }
}