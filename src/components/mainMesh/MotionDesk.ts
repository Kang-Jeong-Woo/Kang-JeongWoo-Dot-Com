import {Mesh, Object3D, Quaternion, Scene, Vector3} from "three";
import {ColliderDesc, RigidBody, RigidBodyDesc, World} from "@dimforge/rapier3d-compat";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader.js";

export default class MotionDesk {
    position: Vector3;
    mesh!: Mesh;
    rigidBody!: RigidBody;
    private initialHeight: number;
    private time: number = 0;
    private readonly animationDuration: number = 2;
    private readonly minHeight: number = 0.13;
    private readonly maxHeight: number = 0.2;

    constructor(position: Vector3) {
        this.position = position;
        this.initialHeight = position.y;
    }

    async init(scene: Scene, world: World) {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync('3dModel/motion_desk/motion_desk.mtl');
        materials.preload();
        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync('3dModel/motion_desk/motion_desk.obj');
        scene.add(object);

        const motionDeskMesh = object.getObjectByName("Desk_low") as Mesh;
        const feetDeskMesh = object.getObjectByName("feet_low") as Mesh;

        const scale = 1.1;

        motionDeskMesh.traverse((child: Object3D) => {
            if (child instanceof Mesh) {
                child.position.copy(this.position);
                child.scale.set(scale, scale, scale);
                child.receiveShadow = true;
                child.castShadow = true;
            }
        })
        feetDeskMesh.traverse((child: Object3D) => {
            if (child instanceof Mesh) {
                child.position.copy(this.position);
                child.scale.set(scale, scale, scale);
                child.receiveShadow = true;
                child.castShadow = true;
            }
        })

        const thoughtFaceBody = world.createRigidBody(
            RigidBodyDesc.fixed()
                .setTranslation(this.position.x, this.position.y, this.position.z)
                .setCanSleep(true)
                .setLinearDamping(1)
                .setAngularDamping(1)
                .setGravityScale(1)
        );

        const thoughtFaceShape = ColliderDesc.cuboid(0.4, 0.27, 0.2)
            .setTranslation(0, 0.14, 0)
            .setMass(1)
            .setRestitution(0)
            .setFriction(5)
            .setSensor(false);

        this.mesh = motionDeskMesh;
        this.rigidBody = thoughtFaceBody;
        this.rigidBody.userData = this.mesh;
        scene.add(this.mesh)
        scene.add(feetDeskMesh);
        world.createCollider(thoughtFaceShape, thoughtFaceBody);
    }

    update(deltaTime: number) {
        if (this.mesh && this.rigidBody) {
            this.time += deltaTime;

            const progress = (Math.sin(this.time * Math.PI / this.animationDuration) + 1) / 2;
            const currentHeight = this.minHeight + (this.maxHeight - this.minHeight) * progress;
            const currentPosition = this.rigidBody.translation();

            const newPosition = {
                x: currentPosition.x,
                y: this.initialHeight + (currentHeight - this.minHeight),
                z: currentPosition.z
            };

            this.rigidBody.setTranslation(newPosition, true);
            this.mesh.position.copy(this.rigidBody.translation() as Vector3);
            this.mesh.quaternion.copy(this.rigidBody.rotation() as Quaternion);
        }
    }
};