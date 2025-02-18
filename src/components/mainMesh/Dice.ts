import {ColliderDesc, RigidBody, RigidBodyDesc, World} from "@dimforge/rapier3d-compat";
import {Mesh, Scene, Vector3} from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader.js";

export default class Dice {
    mesh!: Mesh;
    rigidBody!: RigidBody;

    constructor() {}

    async init(scene: Scene, world: World, position: Vector3) {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync('3dModel/dice/Dice.mtl');
        materials.preload();
        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync('3dModel/dice/Dice.obj');
        scene.add(object);

        const scale = 0.1;

        const diceMesh = object.getObjectByName("g_Dice_Roundcube.001") as Mesh;
        diceMesh.castShadow = true;
        diceMesh.receiveShadow = true;
        diceMesh.scale.set(scale, scale, scale);

        const diceBody = world.createRigidBody(
            RigidBodyDesc.dynamic()
                .setTranslation(position.x, position.y, position.z)
                .setCanSleep(true)
                .setLinearDamping(0.5)
                .setAngularDamping(0.3)
                .setGravityScale(1)
        );

        const originalPoints = new Float32Array(diceMesh.geometry.attributes.position.array);

        const scaledPoints = new Float32Array(originalPoints.length);
        for (let i = 0; i < originalPoints.length; i++) {
            scaledPoints[i] = originalPoints[i] * scale;
        }

        const diceShape = (ColliderDesc.convexHull(scaledPoints) as ColliderDesc)
            .setMass(0.2)
            .setRestitution(0.3)
            .setFriction(0.8)

        world.createCollider(diceShape, diceBody);

        this.mesh = diceMesh
        this.rigidBody = diceBody
    }

    throw() {
        const throwStrength = 5;
        const diagonalAngle = Math.PI / 8;
        this.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);

        const rotX = Math.random() * Math.PI * 2;
        const rotY = Math.random() * Math.PI * 2;
        const rotZ = Math.random() * Math.PI * 2;
        const rotW = Math.random() * Math.PI * 2;
        this.rigidBody.setRotation({x: rotX, y: rotY, z: rotZ, w: rotW}, true);

        const throwDirection = new Vector3(
            Math.cos(diagonalAngle) + (Math.random() - 0.5) * 0.2,
            40 + Math.random() * 5,
            Math.sin(diagonalAngle) + (Math.random() - 0.5) * 0.2
        ).normalize();

        this.rigidBody.applyImpulse(
            {
                x: throwDirection.x * throwStrength,
                y: throwDirection.y * throwStrength,
                z: throwDirection.z * throwStrength
            },
            true
        );

        this.rigidBody.applyTorqueImpulse(
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

        this.rigidBody.setAngvel(angularVelocity, true);
    }

    update() {
        this.mesh.position.copy(this.rigidBody.translation());
        this.mesh.quaternion.copy(this.rigidBody.rotation());
    }
}