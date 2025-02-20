import {BoxGeometry, Mesh, MeshStandardMaterial, Scene, Vector3} from "three";
import {ColliderDesc, RigidBodyDesc, World} from "@dimforge/rapier3d-compat";
import IGeometry from "../interfaces/IGeometry.ts";

export default class Wall {
    constructor(scene: Scene, world: World, geometry: IGeometry, position: Vector3) {
        const wall = new Mesh(
            new BoxGeometry(geometry.width, geometry.height, geometry.depth),
            new MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0,
                transparent: true,
                opacity: 0,
                depthWrite: false
            })
        );
        wall.receiveShadow = true;
        wall.position.set(position.x, position.y, position.z);
        scene.add(wall);

        const railBody = world.createRigidBody(
            RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z)
        );
        const railShape = ColliderDesc.cuboid(geometry.width / 2, geometry.height / 2, geometry.depth / 2);

        world.createCollider(railShape, railBody);
    }
};