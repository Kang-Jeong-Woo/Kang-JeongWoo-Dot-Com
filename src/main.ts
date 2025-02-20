import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import {
    Clock, PCFSoftShadowMap, PerspectiveCamera, Scene, Vector3, WebGLRenderer
} from "three";
import ISizes from "./components/interfaces/ISizes";
import FollowCursor from "./components/env/FollowCursor";
import Floor from "./components/env/Floor.ts";
import RAPIER, {World} from '@dimforge/rapier3d-compat'
import RapierDebugRenderer from "./components/debugger/RapierDebugRenderer.ts";
import ShowLight from "./components/env/ShowLight.ts";
import UI from "./components/UI/UI.ts";
import ScrollStructure from "./components/env/ScrollStructure.ts";

/**
 * Base
 */
// World
await RAPIER.init()
const gravity = new Vector3(0.0, -10, 0.0)
const world = new World(gravity)

const sizes: ISizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;
// Scene
const scene = new Scene()
// Camera
const camera = new PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
// Renderer
const renderer = new WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
})
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
// UI
new UI();

/**
 * Debugger
 */
const gui = new GUI()
const rapierDebugger = new RapierDebugRenderer(scene, world);
rapierDebugger.enabled = true;

/**
 * Lights
 */
const showLight = new ShowLight(scene, gui);

/**
 * Floor
 */
const floor = new Floor({width:50, height:1, depth: 50});
await floor.init(scene, world, new Vector3(0, -1, 0));

/**
 * Cursor
 */
const followCursor = new FollowCursor(sizes);

/**
 * Objects
 */
const scrollStructure = new ScrollStructure(scene, world, camera, renderer, gui);
await scrollStructure.init(scene, world);

/**
 * Animate
 */
const clock = new Clock()
let previousTime = 0

const animate = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // rapierDebugger.update();

    scrollStructure.update(deltaTime);
    showLight.update();

    const parallaxX = followCursor.cursor.x * 0.05;
    const parallaxY = -followCursor.cursor.y * 0.05;
    scrollStructure.followCamera.updateParallax(parallaxX, parallaxY);

    renderer.render(scene, scrollStructure.followCamera.camera);
    world.timestep = Math.min(deltaTime, 0.1)
    world.step();

    requestAnimationFrame(animate);
}

animate()