import {
    Audio,
    AudioListener,
    AudioLoader,
    Group,
    Object3D,
    PerspectiveCamera,
    Scene,
    Vector3,
    WebGLRenderer
} from "three";
import {gsap} from "gsap";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import {World} from "@dimforge/rapier3d-compat";
import Awards from "../mainMesh/Awards.ts";
import Yut from "../mainMesh/Yut.ts";
import Dice from "../mainMesh/Dice.ts";
import Racer from "../mainMesh/Racer.ts";
import Keyboard from "../UI/Keyboard.ts";
import MonsterTruck from "../mainMesh/MonsterTruck.ts";

// 여기가 더이상 followcamera 가 아닌 핵심 rule 역할을 하는 곳.
// 여기가 이제 거즘 rule.ts 가 되는 곳임.
export default class FollowCamera {
    camera: PerspectiveCamera
    cameraGroup: Group
    pivot = new Object3D()
    yaw = new Object3D()
    pitch = new Object3D()

    listener: AudioListener;
    sound: Audio;
    audioInitialized: boolean = false;

    currentSection = 1;
    totalSections: number = document.querySelectorAll('.section').length;
    isScrolling = false;

    gui: GUI;

    awards: Array<Awards> = [];
    scene: Scene;
    world: World;
    private isAwardsCreated: boolean = false;

    yut: Yut = new Yut();
    dice: Dice = new Dice();

    racer: Racer = new Racer(new Vector3(-2, 5.1, 0.3));
    keyboard: Keyboard;
    truck: MonsterTruck;

    constructor(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, cameraPosition: Vector3, gui: GUI, world: World) {
        this.scene = scene;
        this.world = world;

        this.camera = camera
        this.cameraGroup = new Group()

        this.listener = new AudioListener();
        this.camera.add(this.listener);
        this.sound = new Audio(this.listener);

        scene.add(this.cameraGroup)
        this.cameraGroup.add(this.pivot)
        this.pivot.add(this.yaw)
        this.yaw.add(this.pitch)
        this.pitch.add(camera)

        this.yaw.position.x = cameraPosition.x
        this.yaw.position.y = cameraPosition.y
        this.yaw.position.z = cameraPosition.z

        this.pitch.rotation.x = -0.6

        window.addEventListener('wheel', this.onDocumentMouseWheel)

        this.gui = gui;
        this.setupDebugUI();

        window.addEventListener('click', this.onClickHandler);

        this.keyboard = new Keyboard(renderer);
        this.truck = new MonsterTruck(this.keyboard.keyMap, new Vector3(0, 5, 0));
    }

    async init() {
        await this.yut.init(this.scene, this.world, new Vector3(-0.2, 7.8, -0.1));
        await this.dice.init(this.scene, this.world, new Vector3(0.2, 7.8, -0.1));
        await this.racer.init(this.scene, this.world);
        await this.truck.init(this.scene, this.world);
    }

    private onClickHandler = async () => {
        if (this.currentSection === 4) {
            this.isAwardsCreated = true;
            const createdArards = new Awards(new Vector3(1.8, 8, -0.1))
            await createdArards.init(this.scene, this.world);
            this.awards.push(createdArards);
        }
        if (this.currentSection === 5) {
            this.dice.throw();
            this.yut.throw();
        }
        if (this.currentSection === 6) {
            await this.racer.jump();
        }
        if (this.currentSection === 7) {
            this.truck.resetPosition();
        }
    }

    initAudio() {
        if (this.audioInitialized) return;

        const audioLoader = new AudioLoader();
        audioLoader.load('keyboard-typing.mp3', (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true);
            this.sound.setVolume(0.5);
            this.audioInitialized = true;
        });
    }

    setupDebugUI() {
        // Pivot 폴더
        const pivotFolder = this.gui.addFolder('Pivot');

        // Position
        const pivotPosition = pivotFolder.addFolder('Position');
        pivotPosition.add(this.pivot.position, 'x').min(-10).max(10).step(0.1).name('X');
        pivotPosition.add(this.pivot.position, 'y').min(-10).max(10).step(0.1).name('Y');
        pivotPosition.add(this.pivot.position, 'z').min(-10).max(10).step(0.1).name('Z');

        // Rotation
        const pivotRotation = pivotFolder.addFolder('Rotation');
        pivotRotation.add(this.pivot.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('X');
        pivotRotation.add(this.pivot.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('Y');
        pivotRotation.add(this.pivot.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01).name('Z');

        // Yaw 폴더
        const yawFolder = this.gui.addFolder('Yaw');

        // Position
        const yawPosition = yawFolder.addFolder('Position');
        yawPosition.add(this.yaw.position, 'x').min(-10).max(10).step(0.1).name('X');
        yawPosition.add(this.yaw.position, 'y').min(-10).max(10).step(0.1).name('Y');
        yawPosition.add(this.yaw.position, 'z').min(-10).max(10).step(0.1).name('Z');

        // Rotation
        const yawRotation = yawFolder.addFolder('Rotation');
        yawRotation.add(this.yaw.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('X');
        yawRotation.add(this.yaw.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('Y');
        yawRotation.add(this.yaw.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01).name('Z');

        // Pitch 폴더
        const pitchFolder = this.gui.addFolder('Pitch');

        // Position
        const pitchPosition = pitchFolder.addFolder('Position');
        pitchPosition.add(this.pitch.position, 'x').min(-10).max(10).step(0.1).name('X');
        pitchPosition.add(this.pitch.position, 'y').min(-10).max(10).step(0.1).name('Y');
        pitchPosition.add(this.pitch.position, 'z').min(-10).max(10).step(0.1).name('Z');

        // Rotation
        const pitchRotation = pitchFolder.addFolder('Rotation');
        pitchRotation.add(this.pitch.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('X');
        pitchRotation.add(this.pitch.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('Y');
        pitchRotation.add(this.pitch.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01).name('Z');

        // Save/Load 기능
        const saveObject = {
            save: () => {
                const settings = {
                    pivot: {
                        position: { ...this.pivot.position },
                        rotation: { ...this.pivot.rotation }
                    },
                    yaw: {
                        position: { ...this.yaw.position },
                        rotation: { ...this.yaw.rotation }
                    },
                    pitch: {
                        position: { ...this.pitch.position },
                        rotation: { ...this.pitch.rotation }
                    }
                };
                localStorage.setItem('cameraSettings', JSON.stringify(settings));
            },
            load: () => {
                const settings = JSON.parse(localStorage.getItem('cameraSettings') || '{}');
                if (settings.pivot) {
                    Object.assign(this.pivot.position, settings.pivot.position);
                    Object.assign(this.pivot.rotation, settings.pivot.rotation);
                }
                if (settings.yaw) {
                    Object.assign(this.yaw.position, settings.yaw.position);
                    Object.assign(this.yaw.rotation, settings.yaw.rotation);
                }
                if (settings.pitch) {
                    Object.assign(this.pitch.position, settings.pitch.position);
                    Object.assign(this.pitch.rotation, settings.pitch.rotation);
                }
                // GUI 업데이트
                // this.gui.updateDisplay();
            }
        };

        const utilsFolder = this.gui.addFolder('Utils');
        utilsFolder.add(saveObject, 'save').name('Save Settings');
        utilsFolder.add(saveObject, 'load').name('Load Settings');

        pivotFolder.open();
        yawFolder.open();
        pitchFolder.open();
        utilsFolder.open();
    }

    updateParallax(parallaxX: number, parallaxY: number) {
        gsap.to(this.cameraGroup.position, {
            x: parallaxX,
            y: parallaxY,
            duration: 0.5,
            ease: "power2.out"
        });
        if (this.awards.length > 0 && this.currentSection === 4) {
            for (const award of this.awards) {
                award.update();
            }
        }
    }

    update(delta:number) {
        this.yut.update();
        this.dice.update();
        this.racer.update(delta);
        this.truck.update();
    }

    private cleanupAwards() {
        if (this.awards.length > 0 && this.currentSection !== 4) {
            for (const award of this.awards) {
                award.dispose(this.scene, this.world);
            }
            this.awards = [];
            this.isAwardsCreated = false;
        }
    }

    onDocumentMouseWheel = (e: WheelEvent) => {
        if (this.isScrolling) return;

        this.isScrolling = true;
        setTimeout(() => {
            this.isScrolling = false;
        }, 800);

        if (e.deltaY > 0 && this.currentSection < this.totalSections) {
            this.currentSection++;
        } else if (e.deltaY < 0 && this.currentSection > 1) {
            this.currentSection--;
        }

        this.cleanupAwards();

        if (this.currentSection === 1) {
            this.moveCamera(new Vector3(-2.2, 10, -2.8));
        }
        if (this.currentSection === 2) {
            this.moveCamera(new Vector3(-2.6, 7.7, -2.8));
        }
        if (this.currentSection === 3) {
            this.moveCamera(new Vector3(0.4, 7.7, -2.8));
        }
        if (this.currentSection === 4) {
            this.moveCamera(new Vector3(2, 5.2, -2.8));
        }
        if (this.currentSection === 5) {
            this.moveCamera(new Vector3(0, 5.2, -2.8));
        }
        if (this.currentSection === 6) {
            this.moveCamera(new Vector3(-2, 2.8, -2.8));
        }
        if (this.currentSection === 7) {
            this.moveCamera(new Vector3(0, 2.8, -2.8));
        }
        if (this.currentSection === 8) {
            this.moveCamera(new Vector3(2, 0.5, -2.8));
        }

        this.updateSection();
    }

    updateSection() {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        const foundSection = document.getElementById(`section${this.currentSection}`);
        if (foundSection) {
            foundSection.classList.add('active');
        }
    }

    moveCamera(toPosition: Vector3, pitch:number = -0.6) {
        gsap.to(this.yaw.position, {
            duration: 1.5,
            ease: 'power2.inOut',
            x: toPosition.x,
            y: toPosition.y,
            z: toPosition.z,
        })
        gsap.to(this.pitch.rotation, {
            duration: 1.5,
            ease: 'power2.inOut',
            x: pitch,
        })
    }

    dispose() {
        window.removeEventListener('click', this.onClickHandler);
        window.removeEventListener('wheel', this.onDocumentMouseWheel);
        this.cleanupAwards();
    }
}