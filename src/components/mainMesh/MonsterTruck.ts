import {Mesh, Object3D, Quaternion, Scene, SpotLight, TextureLoader, Vector3} from "three";
import {
    ColliderDesc,
    ImpulseJoint,
    JointData, MotorModel,
    PrismaticImpulseJoint,
    RigidBody,
    RigidBodyDesc,
    World
} from "@dimforge/rapier3d-compat";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {Lensflare, LensflareElement} from "three/examples/jsm/objects/Lensflare.js";

export default class MonsterTruck {
    dynamicBodies: [Object3D, RigidBody][] = []
    carBody?: RigidBody
    wheelBLMotor?: ImpulseJoint
    wheelBRMotor?: ImpulseJoint
    wheelFLAxel?: ImpulseJoint
    wheelFRAxel?: ImpulseJoint
    v = new Vector3()
    keyMap: { [key: string]: boolean }
    lightLeftTarget = new Object3D()
    lightRightTarget = new Object3D()
    initPosition: Vector3;

    constructor(keyMap: { [key: string]: boolean }, position: Vector3) {
        this.keyMap = keyMap
        this.lightLeftTarget.position.set(-0.2, -1, 1)
        this.lightRightTarget.position.set(0.2, -1, 1)
        this.initPosition = position;
    }

    async init(scene: Scene, world: World) {
        const scale = 0.005;
        const wheelScale = 0.008;
        const gltfLoader = new GLTFLoader();
        const gltf = await gltfLoader.loadAsync("3dModel/monster_truck/monster_truck.glb");
        const object = gltf.scene.getObjectByName("vehicle-monster-truck");
        if (object) {
            const carMesh = object.getObjectByName("body") as Mesh;
            carMesh.scale.set(scale, scale, scale);
            carMesh.position.copy(this.initPosition);
            carMesh.castShadow = true;

            const wheelBLMesh = object.getObjectByName("wheel-bl") as Mesh;
            wheelBLMesh.scale.set(wheelScale, wheelScale, wheelScale);
            wheelBLMesh.castShadow = true;
            const wheelBRMesh = object.getObjectByName("wheel-br") as Mesh;
            wheelBRMesh.scale.set(wheelScale, wheelScale, wheelScale);
            wheelBRMesh.castShadow = true;
            const wheelFLMesh = object.getObjectByName("wheel-fl") as Mesh;
            wheelFLMesh.scale.set(wheelScale, wheelScale, wheelScale);
            wheelFLMesh.castShadow = true;
            const wheelFRMesh = object.getObjectByName("wheel-fr") as Mesh;
            wheelFRMesh.scale.set(wheelScale, wheelScale, wheelScale);
            wheelFRMesh.castShadow = true;

            scene.add(carMesh, wheelBLMesh, wheelBRMesh, wheelFLMesh, wheelFRMesh);

            this.carBody = world.createRigidBody(
                RigidBodyDesc.dynamic()
                    .setTranslation(this.initPosition.x, this.initPosition.y, this.initPosition.z)
                    .setRotation(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI * 90 / 180))
                    .setCanSleep(false)
                    .setCanSleep(false)
                    .setLinearDamping(1)
                    .setAngularDamping(1)
            );

            const wheelBLBody = world.createRigidBody(
                RigidBodyDesc.dynamic()
                    .setTranslation(this.initPosition.x-0.15, this.initPosition.y, this.initPosition.z+0.15)
                    .setCanSleep(false)
                    .setCanSleep(false)
                    .setLinearDamping(1)
                    .setAngularDamping(1)
            );
            const wheelBRBody = world.createRigidBody(
                RigidBodyDesc.dynamic()
                    .setTranslation(this.initPosition.x+0.15, this.initPosition.y, this.initPosition.z+0.15)
                    .setCanSleep(false)
                    .setCanSleep(false)
                    .setLinearDamping(0.5)
                    .setAngularDamping(0.5)
            )

            const wheelFLBody = world.createRigidBody(
                RigidBodyDesc.dynamic()
                    .setTranslation(this.initPosition.x-0.15, this.initPosition.y, this.initPosition.z-0.15)
                    .setCanSleep(false)
                    .setLinearDamping(0.5)
                    .setAngularDamping(0.5)
            )
            const wheelFRBody = world.createRigidBody(
                RigidBodyDesc.dynamic()
                    .setTranslation(this.initPosition.x+0.15, this.initPosition.y, this.initPosition.z-0.15)
                    .setCanSleep(false)
                    .setLinearDamping(0.5)
                    .setAngularDamping(0.5)
            )

            const axelFLBody = world.createRigidBody(
                RigidBodyDesc.dynamic()
                    .setTranslation(this.initPosition.x-0.15, this.initPosition.y, this.initPosition.z-0.15)
                    .setCanSleep(false)
            )
            const axelFRBody = world.createRigidBody(
                RigidBodyDesc.dynamic()
                    .setTranslation(this.initPosition.x+0.15, this.initPosition.y, this.initPosition.z-0.15)
                    .setCanSleep(false)
            )

            const v = new Vector3()
            let positions: number[] = []
            carMesh.updateMatrixWorld(true)
            carMesh.traverse((o) => {
                if (o.type === 'Mesh') {
                    const positionAttribute = (o as Mesh).geometry.getAttribute('position')
                    for (let i = 0, l = positionAttribute.count; i < l; i++) {
                        v.fromBufferAttribute(positionAttribute, i)
                        v.applyMatrix4((o.parent as Object3D).matrixWorld)
                        v.multiplyScalar(scale)
                        positions.push(...v)
                    }
                }
            })

            const carShape = (ColliderDesc.convexMesh(new Float32Array(positions)) as ColliderDesc)
                .setMass(0.1)
                .setRestitution(0.2)
                .setFriction(5.0)
                .setCollisionGroups(131073)
            const wheelBLShape = ColliderDesc.cylinder(0.05, 0.15)
                .setRotation(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2))
                .setRestitution(0.2)
                .setFriction(5.0)
                .setCollisionGroups(262145)
            const wheelBRShape = ColliderDesc.cylinder(0.05, 0.15)
                .setRotation(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2))
                .setRestitution(0.2)
                .setFriction(5.0)
                .setCollisionGroups(262145)
            const wheelFLShape = ColliderDesc.cylinder(0.05, 0.15)
                .setRotation(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2))
                .setRestitution(0.2)
                .setFriction(5.0)
                .setCollisionGroups(262145)
            const wheelFRShape = ColliderDesc.cylinder(0.05, 0.15)
                .setRotation(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2))
                .setRestitution(0.2)
                .setFriction(5.0)
                .setCollisionGroups(262145)
            const axelFLShape = ColliderDesc.cuboid(0.025, 0.025, 0.025)
                .setRotation(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2))
                .setMass(0.1)
                .setCollisionGroups(524288)
            const axelFRShape = ColliderDesc.cuboid(0.025, 0.025, 0.025)
                .setRotation(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2))
                .setMass(0.1)
                .setCollisionGroups(524288)

            this.wheelBLMotor = world.createImpulseJoint(JointData.revolute(new Vector3(-0.15, 0.15, 0), new Vector3(0, 0, 0), new Vector3(-1, 0, 0)), this.carBody, wheelBLBody, true)
            this.wheelBRMotor = world.createImpulseJoint(JointData.revolute(new Vector3(0.15, 0.15, 0), new Vector3(0, 0, 0), new Vector3(-1, 0, 0)), this.carBody, wheelBRBody, true)

            this.wheelFLAxel = world.createImpulseJoint(JointData.revolute(new Vector3(-0.15, -0.15, 0), new Vector3(0, 0, 0), new Vector3(0, 0, 1)), this.carBody, axelFLBody, true)
            ;(this.wheelFLAxel as PrismaticImpulseJoint).configureMotorModel(MotorModel.ForceBased)
            this.wheelFRAxel = world.createImpulseJoint(JointData.revolute(new Vector3(0.15, -0.15, 0), new Vector3(0, 0, 0), new Vector3(0, 0, 1)), this.carBody, axelFRBody, true)
            ;(this.wheelFRAxel as PrismaticImpulseJoint).configureMotorModel(MotorModel.ForceBased)

            world.createImpulseJoint(JointData.revolute(new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(1, 0, 0)), axelFLBody, wheelFLBody, true)
            world.createImpulseJoint(JointData.revolute(new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(1, 0, 0)), axelFRBody, wheelFRBody, true)

            world.createCollider(carShape, this.carBody)
            world.createCollider(wheelBLShape, wheelBLBody)
            world.createCollider(wheelBRShape, wheelBRBody)
            world.createCollider(wheelFLShape, wheelFLBody)
            world.createCollider(wheelFRShape, wheelFRBody)
            world.createCollider(axelFLShape, axelFLBody)
            world.createCollider(axelFRShape, axelFRBody)

            this.dynamicBodies.push([carMesh, this.carBody])
            this.dynamicBodies.push([wheelBLMesh, wheelBLBody])
            this.dynamicBodies.push([wheelBRMesh, wheelBRBody])
            this.dynamicBodies.push([wheelFLMesh, wheelFLBody])
            this.dynamicBodies.push([wheelFRMesh, wheelFRBody])
            this.dynamicBodies.push([new Object3D(), axelFRBody])
            this.dynamicBodies.push([new Object3D(), axelFLBody])

            const textureLoader = new TextureLoader()
            const textureFlare0 = textureLoader.load('3dModel/monster_truck/lensflare0.png')
            const textureFlare3 = textureLoader.load('3dModel/monster_truck/lensflare3.png')

            const lensflareLeft = new Lensflare()
            lensflareLeft.addElement(new LensflareElement(textureFlare0, 1000, 0))
            lensflareLeft.addElement(new LensflareElement(textureFlare3, 500, 0.2))
            lensflareLeft.addElement(new LensflareElement(textureFlare3, 250, 0.8))
            lensflareLeft.addElement(new LensflareElement(textureFlare3, 125, 0.6))
            lensflareLeft.addElement(new LensflareElement(textureFlare3, 62.5, 0.4))

            const lensflareRight = new Lensflare()
            lensflareRight.addElement(new LensflareElement(textureFlare0, 1000, 0))
            lensflareRight.addElement(new LensflareElement(textureFlare3, 500, 0.2))
            lensflareRight.addElement(new LensflareElement(textureFlare3, 250, 0.8))
            lensflareRight.addElement(new LensflareElement(textureFlare3, 125, 0.6))
            lensflareRight.addElement(new LensflareElement(textureFlare3, 62.5, 0.4))

            const headLightLeft = new SpotLight(undefined, Math.PI * 20)
            headLightLeft.position.set(0.2, 1, 1)
            headLightLeft.angle = Math.PI / 8
            headLightLeft.penumbra = 0.5
            headLightLeft.castShadow = true
            headLightLeft.shadow.blurSamples = 10
            headLightLeft.shadow.radius = 5

            const headLightRight = headLightLeft.clone()
            headLightRight.position.set(0.2, 1, 1)

            carMesh.add(headLightLeft)
            headLightLeft.target = this.lightLeftTarget
            headLightLeft.add(lensflareLeft)
            carMesh.add(this.lightLeftTarget)

            carMesh.add(headLightRight)
            headLightRight.target = this.lightRightTarget
            headLightRight.add(lensflareRight)
            carMesh.add(this.lightRightTarget)

            for (let i = 0, n = this.dynamicBodies.length; i < n; i++) {
                this.dynamicBodies[i][1].sleep()
            }
        }
    }

    update() {
        for (let i = 0, n = this.dynamicBodies.length; i < n; i++) {
            this.dynamicBodies[i][0].position.copy(this.dynamicBodies[i][1].translation())
            this.dynamicBodies[i][0].quaternion.copy(this.dynamicBodies[i][1].rotation())
        }

        let targetVelocity = 0
        if (this.keyMap['KeyW']) {
            if (this.dynamicBodies[0][1].isSleeping()) {
                for (let i = 0, n = this.dynamicBodies.length; i < n; i++) {
                    this.dynamicBodies[i][1].wakeUp()
                }
            }
            targetVelocity = 100;
        }
        if (this.keyMap['KeyS']) {
            targetVelocity = -40
        }
        ;(this.wheelBLMotor as PrismaticImpulseJoint).configureMotorVelocity(targetVelocity, 2.0)
        ;(this.wheelBRMotor as PrismaticImpulseJoint).configureMotorVelocity(targetVelocity, 2.0)

        let targetSteer = 0
        if (this.keyMap['KeyD']) {
            targetSteer += 0.3
        }
        if (this.keyMap['KeyA']) {
            targetSteer -= 0.3
        }

        ;(this.wheelFLAxel as PrismaticImpulseJoint).configureMotorPosition(targetSteer, 100, 10)
        ;(this.wheelFRAxel as PrismaticImpulseJoint).configureMotorPosition(targetSteer, 100, 10)
    }

    resetPosition() {
        if (!this.carBody) return;

        this.carBody.setTranslation({ x: this.initPosition.x, y: this.initPosition.y, z: this.initPosition.z }, false);
        this.carBody.setRotation(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI * 90 / 180), false);
        this.carBody.setLinvel({ x: 0, y: 0, z: 0 }, false);
        this.carBody.setAngvel({ x: 0, y: 0, z: 0 }, false);

        const wheelPositions = [
            { x: this.initPosition.x-0.15, y: this.initPosition.y, z: this.initPosition.z+0.15 },
            { x: this.initPosition.x+0.15, y: this.initPosition.y, z: this.initPosition.z+0.15 },
            { x: this.initPosition.x-0.15, y: this.initPosition.y, z: this.initPosition.z-0.15 },
            { x: this.initPosition.x+0.15, y: this.initPosition.y, z: this.initPosition.z-0.15 },
            { x: this.initPosition.x-0.15, y: this.initPosition.y, z: this.initPosition.z-0.15 },
            { x: this.initPosition.x+0.15, y: this.initPosition.y, z: this.initPosition.z-0.15 }
        ];

        for (let i = 1; i < this.dynamicBodies.length; i++) {
            const body = this.dynamicBodies[i][1];
            body.setTranslation(wheelPositions[i-1], false);
            body.setLinvel({ x: 0, y: 0, z: 0 }, false);
            body.setAngvel({ x: 0, y: 0, z: 0 }, false);
        }

        for (let i = 0; i < this.dynamicBodies.length; i++) {
            this.dynamicBodies[i][1].sleep();
        }
    }
}