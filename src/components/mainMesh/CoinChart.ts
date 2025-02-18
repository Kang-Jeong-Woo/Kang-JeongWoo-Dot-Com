import {
    Mesh, MeshStandardMaterial, NearestFilter,
    Object3D, PerspectiveCamera,
    Raycaster, Scene, TextureLoader,
    Vector2, Vector3, WebGLRenderer
} from "three";
import {RigidBody, World} from "@dimforge/rapier3d-compat";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader.js";
import gsap from "gsap";

export default class CoinChart {
    position: Vector3;
    mesh!: Mesh;
    rigidBody!: RigidBody;
    meshes: Mesh[] = [];
    rigidBodies: RigidBody[] = [];
    objectName: Array<string> = ["Arrow", "Coin", "BigCoin", "MidCoin", "Cube.008", "Chart"];
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    raycaster: Raycaster;
    mouse: Vector2;
    prevMouse: Vector2;

    constructor(position: Vector3, camera: PerspectiveCamera, renderer: WebGLRenderer) {
        this.position = position;
        this.raycaster = new Raycaster();
        this.mouse = new Vector2();
        this.camera = camera;
        this.renderer = renderer;
        this.prevMouse = new Vector2(0, 0);
    }

    async init(scene: Scene, world: World) {
        const textureLoader = new TextureLoader();
        const gradientTexture = await textureLoader.loadAsync("textures/gradients/5.jpg");
        gradientTexture.magFilter = NearestFilter;

        const barMaterial = new MeshStandardMaterial({
            color: "#F99F9F",
        });
        const arrowMaterial = new MeshStandardMaterial({
            color: "#93C4EF",
        });
        const chartMaterial = new MeshStandardMaterial({
            color: "#FEF295",
        });
        const coinMaterial = new MeshStandardMaterial({
            color: "#FDF856",
            roughness: 1,
            metalness: 1,
        })

        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync('3dModel/chart/coin_chart.mtl');
        materials.preload();
        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync('3dModel/chart/coin_chart.obj');
        scene.add(object);

        const scale = 0.1;

        const meshes = Array.from({length: 6}, (_, i) =>
            object.getObjectByName(this.objectName[i]) as Mesh
        ).filter(mesh => mesh !== undefined);

        meshes.forEach((objectMesh) => {
            objectMesh.traverse((child: Object3D) => {
                if (child instanceof Mesh) {
                    child.position.copy(this.position);
                    child.scale.set(scale, scale, scale);
                    child.receiveShadow = true;
                    child.castShadow = true;
                    if (objectMesh.name === "Arrow") {
                        child.material = arrowMaterial;
                    }
                    if (objectMesh.name === "Chart") {
                        child.material = chartMaterial;
                    }
                    if (objectMesh.name === "Cube.008") {
                        child.material = barMaterial;
                    }
                    if (objectMesh.name === "Coin") {
                        child.material = coinMaterial;
                        child.position.set(this.position.x - 0.5, this.position.y + 0.3, this.position.z);
                    }
                    if (objectMesh.name === "MidCoin") {
                        child.material = coinMaterial;
                        child.position.set(this.position.x + 0.5, this.position.y + 0.2, this.position.z + 0.1);
                    }
                    if (objectMesh.name === "BigCoin") {
                        child.material = coinMaterial;
                        child.position.set(this.position.x - 0.5, this.position.y + 0.1, this.position.z + 0.1);
                    }
                }
            })
            scene.add(objectMesh);
            this.meshes.push(objectMesh);
            this.animateFloat(objectMesh);
        })

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera)
            const intersects = this.raycaster.intersectObjects(this.meshes.filter(mesh=>mesh.name.endsWith("Coin")), true);
            if (intersects.length > 0) {
                const clickedMeshUuid = intersects[0].object.uuid
                const overedMesh = this.meshes.find(mesh => mesh.uuid === clickedMeshUuid)!;

                const mouseX = (this.mouse.x - (overedMesh.position.x / window.innerWidth));
                const mouseY = (this.mouse.y - (overedMesh.position.y / window.innerHeight));

                const currentRotationX = overedMesh.rotation.x;
                const currentRotationY = overedMesh.rotation.y;

                // 임계값 설정 자잘한 움직임 무시
                if (Math.abs(mouseY) > 0.1) {
                    gsap.timeline()
                        .to(overedMesh.rotation, {
                            x: currentRotationX + (Math.sign(mouseY) * 3 * Math.PI),
                            duration: 0.6,
                            ease: "power2.in"
                        })
                        .to(overedMesh.rotation, {
                            x: currentRotationX + (Math.sign(mouseY) * 3.5 * Math.PI),
                            duration: 1,
                            ease: "power4.out"
                        });
                }

                // Y축 회전 => 수평 마우스 이동
                if (Math.abs(mouseX) > 0.1) {
                    gsap.timeline()
                        .to(overedMesh.rotation, {
                            y: currentRotationY + (Math.sign(mouseX) * 3 * Math.PI),
                            duration: 0.6,
                            ease: "power2.in"
                        })
                        .to(overedMesh.rotation, {
                            y: currentRotationY + (Math.sign(mouseX) * 3.5 * Math.PI),
                            duration: 1,
                            ease: "power4.out"
                        });
                }
            }
        });
    }

    animateFloat(mesh: Mesh) {
        gsap.to(mesh.position, {
            y: this.position.y + 0.5,
            duration: 1.5,
            ease: "power1.inOut",
            yoyo: true,
            repeat: -1,
        });
    }
}