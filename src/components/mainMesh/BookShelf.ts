import {
    Mesh, MeshStandardMaterial, Object3D, PerspectiveCamera,
    Scene, Vector3, WebGLRenderer
} from "three";
import FollowCamera from "../env/FollowCamera";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import {ColliderDesc, RigidBodyDesc, World} from "@dimforge/rapier3d-compat";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader.js";

// 여기가 이제 골조가 되는 거임. 이제 여기가 거즘 game.ts 가 되고
export default class BookShelf {
    mainMesh!: Mesh;
    followTarget: Object3D;
    followCamera: FollowCamera;
    // cameraPositions = new Vector3(-2, 10, -2.8);
    cameraPositions = new Vector3(0, 20, 20);

    constructor(scene: Scene, world:World, camera: PerspectiveCamera, renderer: WebGLRenderer, mainTarget: Object3D, gui: GUI) {
        this.followTarget = mainTarget;
        this.followCamera = new FollowCamera(scene, camera, renderer, this.cameraPositions, gui, world);
    }

    async init(scene: Scene, world:World, camera: PerspectiveCamera, renderer: WebGLRenderer, gui: GUI) {
        await this.followCamera.init();

        const bookShelfMaterial = new MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.8,
            metalness: 0.3,
            side: 2
        });

        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync('3dModel/rack_book_shelf/rack_book_shelf.mtl');
        materials.preload();
        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync('3dModel/rack_book_shelf/rack_book_shelf.obj');
        scene.add(object);

        const bookShelfMesh = object.getObjectByName("Rack_Book_Shelf_putih_0") as Mesh;
        const bookShelfMesh2 = object.getObjectByName("Rack_Book_Shelf_hitam_0") as Mesh;
        bookShelfMesh.traverse((child:Object3D)=>{
            if (child instanceof Mesh) {
                child.material = bookShelfMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        })
        bookShelfMesh2.traverse((child:Object3D)=>{
            if (child instanceof Mesh) {
                child.material = bookShelfMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        })

        this.mainMesh = bookShelfMesh;
        scene.add(this.mainMesh)
        scene.add(this.followTarget)

        const bookShelfBody = world.createRigidBody(
            RigidBodyDesc.fixed()
                .setTranslation(0,0,0)
                .setCanSleep(true)
                .setLinearDamping(1)
                .setAngularDamping(1)
                .setGravityScale(1)
        );

        const geometry = bookShelfMesh2.geometry;
        let vertices: Float32Array;
        let indices: any;

        if (geometry.index) {
            vertices = new Float32Array(geometry.attributes.position.array);
            indices = new Uint32Array(geometry.index.array);
        } else {
            vertices = new Float32Array(geometry.attributes.position.array);
            const numVertices = vertices.length / 3;
            indices = [];
            for (let i = 0; i < numVertices; i += 3) {
                indices.push(i, i + 1, i + 2);
            }
            indices = new Uint32Array(indices);
        }

        const bookShelfShape = ColliderDesc.trimesh(vertices, indices)
            .setMass(1)
            .setRestitution(0.1)
            .setFriction(1.5)
            .setSensor(false);

        world.createCollider(bookShelfShape, bookShelfBody);
    }

    update(delta: number) {
        this.followCamera.update(delta);
    }
};