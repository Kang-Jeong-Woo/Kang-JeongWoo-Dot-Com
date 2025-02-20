import {Scene, SpotLight, SpotLightHelper, Vector3} from "three";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import {ILightsProperties} from "../interfaces/ILightsProperties.ts";
import {gsap} from "gsap";

export default class ShowLight {
    private lights: {
        light: SpotLight;
        helper: SpotLightHelper;
        targetOffset: Vector3;
    }[] = [];
    private readonly initialPositions: Array<ILightsProperties> = [
        {
            position: new Vector3(-1.7, 13.8, 0.6), target: new Vector3(0, -0.3, -0.1),
            distance: 2.6, decay: 0, angle: 0.4, penumbra: 0.1, intensity: Math.PI * 100
        },
        {
            position: new Vector3(-1.9, 11.1, 1.2), target: new Vector3(0, -1, -0.9),
            distance: 2.6, decay: 0, angle: 0.351, penumbra: 0.1, intensity: 8
        },
        {
            position: new Vector3(0, 11.5, 0.4), target: new Vector3(0, -1, -0.2),
            distance: 2.6, decay: 0, angle: 0.4, penumbra: 0.1, intensity: 50
        },
        {
            position: new Vector3(2, 9.5, 0), target: new Vector3(0, -1, 0),
            distance: 2.6, decay: 0, angle: 0.4, penumbra: 0.1, intensity: Math.PI * 100
        },
        {
            position: new Vector3(0, 9.5, 0), target: new Vector3(0, -1, 0),
            distance: 2.6, decay: 0, angle: 0.4, penumbra: 0.1, intensity: Math.PI * 100
        },
        {
            position: new Vector3(-3.2, 5.9, 0), target: new Vector3(1.8, -1, 0),
            distance: 2.32, decay: 0, angle: 0.4, penumbra: 0.08, intensity: Math.PI * 100
        },
        {
            position: new Vector3(0, 7.1, 0), target: new Vector3(0, -1, 0),
            distance: 2.6, decay: 0, angle: 0.4, penumbra: 0.1, intensity: 80
        },
        {
            position: new Vector3(2, 4.7, 0), target: new Vector3(0, -1, 0),
            distance: 2.6, decay: 0, angle: 0.36, penumbra: 0.1, intensity: Math.PI * 100
        },
    ];

    constructor(scene: Scene, gui: GUI) {
        this.setupLights(scene);
        // this.setupGUI(gui);
        this.setupAnimation();
    }

    private setupAnimation() {
        const firstLight = this.lights[0];
        if (firstLight) {
            gsap.to(firstLight.targetOffset, {
                x: 0.1,
                duration: 2,
                ease: "power1.inOut",
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    const { x, y, z } = firstLight.light.position;
                    const offset = firstLight.targetOffset;
                    firstLight.light.target.position.set(
                        x + offset.x,
                        y + offset.y,
                        z + offset.z
                    );
                    firstLight.helper.update();
                }
            });
        }
    }

    private setupLights(scene: Scene) {
        this.initialPositions.forEach((props) => {
            const light = new SpotLight('#d3d3d3', props.intensity);

            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;

            light.position.copy(props.position);

            light.distance = props.distance;
            light.decay = props.decay;
            light.angle = props.angle;
            light.penumbra = props.penumbra;

            const targetOffset = props.target;
            light.target.position.set(
                props.position.x + targetOffset.x,
                props.position.y + targetOffset.y,
                props.position.z + targetOffset.z
            );
            scene.add(light.target);

            light.castShadow = true;
            light.shadow.mapSize.set(1024, 1024);
            light.shadow.camera.far = 15;
            light.shadow.camera.near = 1;

            const helper = new SpotLightHelper(light);

            this.lights.push({light, helper, targetOffset});
            scene.add(light);
            // scene.add(helper);
        });
    }

    private setupGUI(gui: GUI) {
        const lightFolder = gui.addFolder('Directional Lights');

        const globalControls = {
            intensity: 0.2,
            visible: true,
            helpers: true
        };

        lightFolder.add(globalControls, 'intensity', 0, 1, 0.1)
            .name('Global Intensity')
            .onChange((value: number) => {
                this.lights.forEach(({light}) => {
                    light.intensity = value;
                });
            });

        lightFolder.add(globalControls, 'visible')
            .name('Show Lights')
            .onChange((value: boolean) => {
                this.lights.forEach(({light}) => {
                    light.visible = value;
                });
            });

        lightFolder.add(globalControls, 'helpers')
            .name('Show Helpers')
            .onChange((value: boolean) => {
                this.lights.forEach(({helper}) => {
                    helper.visible = value;
                });
            });

        this.lights.forEach((lightData, index) => {
            const {light, helper, targetOffset} = lightData;
            const individualFolder = lightFolder.addFolder(`Light ${index + 1}`);

            const updateTargetPosition = () => {
                const {x, y, z} = light.position;
                light.target.position.set(
                    x + targetOffset.x,
                    y + targetOffset.y,
                    z + targetOffset.z
                );
                helper.update();
            };

            // Position controls
            const positionFolder = individualFolder.addFolder('Position');
            positionFolder.add(light.position, 'x', -5, 5, 0.1)
                .name('X')
                .onChange(updateTargetPosition);
            positionFolder.add(light.position, 'y', 0, 15, 0.1)
                .name('Y')
                .onChange(updateTargetPosition);
            positionFolder.add(light.position, 'z', -10, 10, 0.1)
                .name('Z')
                .onChange(updateTargetPosition);

            // Target controls
            const targetFolder = individualFolder.addFolder('Target');
            targetFolder.add(targetOffset, 'x', -5, 5, 0.1)
                .name('Target Offset X')
                .onChange(updateTargetPosition);
            targetFolder.add(targetOffset, 'y', -10, 10, 0.1)
                .name('Target Offset Y')
                .onChange(updateTargetPosition);
            targetFolder.add(targetOffset, 'z', -5, 5, 0.1)
                .name('Target Offset Z')
                .onChange(updateTargetPosition);

            // Light properties
            const propertiesFolder = individualFolder.addFolder('Properties');
            propertiesFolder.add(light, 'distance', 0, 20)
                .onChange(() => helper.update());
            propertiesFolder.add(light, 'decay', 0, 10)
                .onChange(() => helper.update());
            propertiesFolder.add(light, 'angle', 0, 1)
                .onChange(() => helper.update());
            propertiesFolder.add(light, 'penumbra', 0, 1, 0.001)
                .onChange(() => helper.update());
            propertiesFolder.add(helper, 'visible').name('Helper Visible');
            propertiesFolder.addColor(
                {color: '#ffffff'},
                'color'
            ).onChange((value: string) => {
                light.color.set(value);
            });
            propertiesFolder.add(light, 'intensity', 0, 314, 0.1)
                .name('Intensity');

            individualFolder.close();
            positionFolder.close();
            targetFolder.close();
            propertiesFolder.close();
        });
    }

    update() {
        this.lights.forEach(({helper}) => {
            helper.update();
        });
    }

    dispose(scene: Scene) {
        this.lights.forEach(({light, helper}) => {
            scene.remove(light.target);
            scene.remove(light);
            scene.remove(helper);
            light.dispose();
        });
    }
}