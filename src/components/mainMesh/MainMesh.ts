import {
    Mesh,
    MeshToonMaterial,
    NearestFilter,
    Object3D,
    PerspectiveCamera,
    Scene,
    TextureLoader,
    TorusGeometry,
    Vector3, WebGLRenderer
} from "three";
import FollowCamera from "../env/FollowCamera";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import {gsap} from "gsap";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export default class MainMesh {
    mainMesh: Mesh;
    followTarget = new Object3D();
    followCamera: FollowCamera;
    position: Vector3;
    objectDistance: number = 4;
    cameraPositions = {x: 0, y: 0, z: 6};
    controls: OrbitControls;
    debug = {
        rotationSpeed: 0.1,
        cameraDistance: 6,
        orbitSpeed: 1.0,
        autoRotate: false,
        autoRotateSpeed: 2.0
    }

    constructor(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer) {
        this.followCamera = new FollowCamera(scene, camera, renderer)
        this.setupOrbitControls(camera, renderer)
    }

    setupOrbitControls(camera: PerspectiveCamera, renderer: WebGLRenderer) {
        this.controls = new OrbitControls(camera, renderer.domElement)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05
        this.controls.autoRotate = this.debug.autoRotate
        this.controls.autoRotateSpeed = this.debug.autoRotateSpeed
        this.controls.enablePan = false
        this.controls.maxDistance = 10
        this.controls.minDistance = 3
    }

    async init(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, gui: GUI) {
        const textureLoader = new TextureLoader();
        const gradientTexture = await textureLoader.loadAsync("/textures/gradients/3.jpg");
        gradientTexture.magFilter = NearestFilter;

        const material = new MeshToonMaterial({color: "#ffffff", gradientMap: gradientTexture})

        this.mainMesh = new Mesh(
            new TorusGeometry(1, 0.4, 16, 60),
            material
        );

        scene.add(this.mainMesh)
        scene.add(this.followTarget)
        // camera 를 이제 followTarget 에 붙여야함.
        // https://sbcode.net/threejs/obstacle-course-game-part-2/#srcplayerts 의 Player.ts 를 참조하면 좋을 듯 싶음.

        const meshMove = gui.addFolder("meshMove");
        meshMove.add(this.mainMesh.position, "x", -10, 10).onChange(value => {
            this.mainMesh.position.x = value;
        });
        meshMove.add(this.mainMesh.position, "y", -10, 10).onChange(value => {
            this.mainMesh.position.y = value;
        });
        meshMove.add(this.mainMesh.position, "z", -10, 10).onChange(value => {
            this.mainMesh.position.z = value;
        });

        const cameraFolder = gui.addFolder("Camera");
        const moveCamera = () => {
            gsap.to(this.followCamera.camera.position, {
                x: this.cameraPositions.x,
                y: this.cameraPositions.y,
                z: this.cameraPositions.z,
                duration: 2,
                ease: 'power2.out'
            });
        };
        cameraFolder.add(this.cameraPositions, 'x', -10, 10).name('Camera X').onChange(_ => {
            moveCamera();
        });
        cameraFolder.add(this.cameraPositions, 'y', -10, 10).name('Camera Y').onChange(_ => {
            moveCamera();
        });
        cameraFolder.add(this.cameraPositions, 'z', 1, 20).name('Camera Z').onChange(_ => {
            moveCamera();
        });

        const meshFolder = gui.addFolder('Mesh')
        meshFolder.add(this.mainMesh.rotation, 'x', 0, Math.PI * 2, 0.01).name('Rotation X')
        meshFolder.add(this.mainMesh.rotation, 'y', 0, Math.PI * 2, 0.01).name('Rotation Y')
        meshFolder.add(this.debug, 'rotationSpeed', 0, 1, 0.01).name('Rotation Speed')

        const cameraControl = gui.addFolder('Camera Control')
        cameraControl.add(this.debug, 'cameraDistance', 3, 10, 0.1).name('Camera Distance')
        cameraControl.add(this.controls, 'autoRotate').name('Auto Rotate')
        cameraControl.add(this.debug, 'autoRotateSpeed', 0, 10, 0.1)
            .name('Auto Rotate Speed')
            .onChange((value) => {
                this.controls.autoRotateSpeed = value
            })
    }

    updateOrbitControlsTarget(scrollY: number) {
        // Update orbit controls target based on scroll position
        const targetY = -scrollY / window.innerHeight * this.objectDistance
        this.controls.target.y = targetY
        this.mainMesh.position.y = targetY
    }

    update(delta: number, scrollY: number) {
        this.updateOrbitControlsTarget(scrollY)
        this.controls.update()

        if (this.debug.autoRotate) {
            this.mainMesh.rotation.y += this.debug.rotationSpeed * delta
        }
        this.followTarget.position.copy(this.mainMesh.position)
        this.followCamera.pivot.position.lerp(this.mainMesh.position, delta * 10)
    }
};