import {Group, PerspectiveCamera, Scene} from "three";
import {gsap} from "gsap";
import ISizes from "../interfaces/ISizes";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

export default class CameraGroup {
    cameraGroup = new Group();
    camera: PerspectiveCamera;
    cameraPositions = {x: 0, y: 0, z: 6};

    constructor(scene: Scene, sizes: ISizes, gui?: GUI) {
        scene.add(this.cameraGroup);

        this.camera = new PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
        this.camera.position.z = 6
        this.cameraGroup.add(this.camera)

        const cameraFolder = gui?.addFolder("Camera");
        const moveCamera = () => {
            gsap.to(this.camera.position, {
                x: this.cameraPositions.x,
                y: this.cameraPositions.y,
                z: this.cameraPositions.z,
                duration: 2,
                ease: 'power2.out'
            });
        };
        if (cameraFolder) {
            cameraFolder.add(this.cameraPositions, 'x', -10, 10).name('Camera X').onChange(_ => {
                moveCamera();
            });
            cameraFolder.add(this.cameraPositions, 'y', -10, 10).name('Camera Y').onChange(_ => {
                moveCamera();
            });
            cameraFolder.add(this.cameraPositions, 'z', 1, 20).name('Camera Z').onChange(_ => {
                moveCamera();
            });
        }
    }
};