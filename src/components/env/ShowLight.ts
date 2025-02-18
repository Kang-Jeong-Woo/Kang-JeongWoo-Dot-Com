import {AmbientLight, Scene, SpotLight, SpotLightHelper} from "three";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

export default class ShowLight {
    private lights: { light: SpotLight; helper: SpotLightHelper }[] = [];
    private readonly initialPositions = [
        [-1.5, 13.5, 0],
        [-1.9, 11.5, 0.2], [0, 11.5, 0.2], [2, 9.5, 0],
        [0, 9.5, 0], [-2, 7.1, 0], [0, 7.1, 0],
        [2, 4.7, 0]
    ];
    private debugLight: AmbientLight;

    constructor(scene: Scene, gui: GUI) {
        this.setupLights(scene);
        this.setupGUI(gui);
        this.debugLight = new AmbientLight("#d3d3d3", Math.PI * 0.2);
        scene.add(this.debugLight);
    }

    private setupLights(scene: Scene) {
        this.initialPositions.forEach(([x, y, z]) => {
            const light = new SpotLight('#d3d3d3', Math.PI * 100);
            light.position.set(x, y, z);

            light.distance = 2.6
            light.decay = 0
            light.angle = 0.4
            light.penumbra = 0.1

            // light.angle = 0.5;
            // light.distance = 3;
            // light.penumbra = 0.3;
            // light.decay = 1;

            light.target.position.set(x, y - 1, z);
            scene.add(light.target);

            light.castShadow = true;

            light.shadow.mapSize.set(1024, 1024);
            light.shadow.camera.far = 15;
            light.shadow.camera.near = 1;

            const helper = new SpotLightHelper(light);

            this.lights.push({ light, helper });
            scene.add(light);
            scene.add(helper);
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
                this.lights.forEach(({ light }) => {
                    light.intensity = value;
                });
            });

        lightFolder.add(globalControls, 'visible')
            .name('Show Lights')
            .onChange((value: boolean) => {
                this.lights.forEach(({ light }) => {
                    light.visible = value;
                });
            });

        lightFolder.add(globalControls, 'helpers')
            .name('Show Helpers')
            .onChange((value: boolean) => {
                this.lights.forEach(({ helper }) => {
                    helper.visible = value;
                });
            });

        this.lights.forEach(({ light, helper }, index) => {
            const individualFolder = lightFolder.addFolder(`Light ${index + 1}`);

            const updatePosition = () => {
                const { x, y, z } = light.position;
                light.target.position.set(x, y - 1, z);
            };

            individualFolder.add(light.position, 'x', -5, 5, 0.1)
                .name('Position X')
                .onChange(updatePosition);
            individualFolder.add(light.position, 'y', 0, 15, 0.1)
                .name('Position Y')
                .onChange(updatePosition);
            individualFolder.add(light.position, 'z', -10, 10, 0.1)
                .name('Position Z')
                .onChange(updatePosition);

            individualFolder.add(light, 'distance', 0, 20).onChange(() => {
                helper.update()
            })
            individualFolder.add(light, 'decay', 0, 10).onChange(() => {
                helper.update()
            })
            individualFolder.add(light, 'angle', 0, 1).onChange(() => {
                helper.update()
            })
            individualFolder.add(light, 'penumbra', 0, 1, 0.001).onChange(() => {
                helper.update()
            })
            individualFolder.add(helper, 'visible').name('Helper Visible')
            individualFolder.addColor(
                { color: '#ffffff' },
                'color'
            ).onChange((value: string) => {
                light.color.set(value);
            });
            individualFolder.add(light, 'intensity', 0, 1, 0.1)
                .name('Intensity');
        });
    }

    update() {
        this.lights.forEach(({ helper }) => {
            helper.update();
        });
    }

    dispose(scene: Scene) {
        this.lights.forEach(({ light, helper }) => {
            scene.remove(light.target);
            scene.remove(light);
            scene.remove(helper);
            light.dispose();
        });
    }
}