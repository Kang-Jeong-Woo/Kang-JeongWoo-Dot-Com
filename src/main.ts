import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import {
    AnimationAction,
    Clock, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer
} from "three";
import ISizes from "./components/interfaces/ISizes";
import FollowCursor from "./components/env/FollowCursor";
import Floor from "./components/env/Floor.ts";
import RAPIER, {World} from '@dimforge/rapier3d-compat'
import BookShelf from "./components/mainMesh/BookShelf.ts";
import RapierDebugRenderer from "./components/debugger/RapierDebugRenderer.ts";
import ShowLight from "./components/env/ShowLight.ts";
import ThoughtFace from "./components/mainMesh/ThoughtFace.ts";
import MyMarkerMan from "./components/mainMesh/MarkerMan.ts";
import MotionDesk from "./components/mainMesh/MotionDesk.ts";
import UI from "./components/UI/UI.ts";
import MacintoshPc from "./components/mainMesh/MacintoshPc.ts";
import CoinChart from "./components/mainMesh/CoinChart.ts";
import Awards from "./components/mainMesh/Awards.ts";
import RoundedRectShape from "./components/mainMesh/RoundedRectShape.ts";

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
const followTarget = new Object3D();
const bookShelf = new BookShelf(scene, world, camera, renderer, followTarget, gui);
await bookShelf.init(scene, world, camera, renderer, gui);

const thoughtFace = new ThoughtFace(new Vector3(-1.4, 11.9, 0));
await thoughtFace.init(scene);

// 간단 소개 페이지
const animationActions: { [key: string]: AnimationAction } = {}
const markerMan = new MyMarkerMan(new Vector3(-1.4, 9.7, -0.3));
await markerMan.init(animationActions);
scene.add(markerMan);

const desk = new MotionDesk(new Vector3(-2.2, 9.7, 0.4));
await desk.init(scene, world);

const pc = new MacintoshPc(new Vector3(-2.1, 10.4, 0.4));
await pc.init(scene, world);

// 차트 페이지
const coinChart = new CoinChart(new Vector3(0, 9.7, 0.2), camera, renderer);
await coinChart.init(scene, world);

// 수상 페이지
const awards = new Awards(new Vector3(1.8, 7.8, -0.1));
await awards.init(scene, world);

/**
 * Animate
 */
const clock = new Clock()
let previousTime = 0

const animate = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    rapierDebugger.update();

    bookShelf.update(deltaTime);
    showLight.update();
    markerMan.update(deltaTime);
    desk.update(deltaTime);
    pc.update();
    awards.update();

    const parallaxX = followCursor.cursor.x * 0.05;
    const parallaxY = -followCursor.cursor.y * 0.05;
    bookShelf.followCamera.updateParallax(parallaxX, parallaxY);

    renderer.render(scene, bookShelf.followCamera.camera);
    world.timestep = Math.min(deltaTime, 0.1)
    world.step();

    requestAnimationFrame(animate);
}

animate()